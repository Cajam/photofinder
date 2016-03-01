var config = require("./config");
var express = require("express");
var http = require("http");
var authHelper = require("./authHelper");
var outlook = require("node-outlook");
var url = require("url");
var clearbit = require('clearbit')(config.clearbitToken);
var app = express();

app.set('view engine', 'ejs');
app.use(express.static(__dirname));

app.listen(8080, function(){
  console.log("app listening on port 8080");
});

app.get("/", function(req, res){
  // res.render("index.ejs");
  console.log("Home page was called.");
  res.writeHead(200, {"Content-Type": "text/html"});
  res.write('<p>Please <a href="' + authHelper.getAuthUrl() + '">sign in</a> with your Office 365 account.</p>');
  res.end();
});

app.get("/authorize", function(req, res){
  console.log("Authorize page was called.");

  // Pass authorization code as a query paramter
  var url_parts = url.parse(req.url, true);
  var code = url_parts.query.code;
  console.log("Code: " + code);
  authHelper.getTokenFromCode(code, tokenReceived, res);
});

function tokenReceived(res, error, token){
  if (error){
    console.log("Access token error: ", error.message);
    res.writeHead(200, {"Content-Type": "text/html"});
    res.write("<p>Error: " + error + "</p>");
    res.end();
  }
  else {
    var cookies = ['app-token=' + token.token.access_token + ';Max-Age=3600',
                  'app-email=' + authHelper.getEmailFromIdToken(token.token.id_token) + ';Max-Age=3600'];
    res.setHeader('Set-Cookie', cookies);
    res.writeHead(302, {'Location': 'http://localhost:8000/mail'});
    res.end();
  }
}

function getValueFromCookie(valueName, cookie){
  if (cookie.indexOf(valueName) !== -1) {
    var start = cookie.indexOf(valueName) + valueName.length + 1;
    var end = cookie.indexOf(';', start);
    end = end === -1 ? cookie.length : end;
    return cookie.substring(start, end);
  }
}

app.get("/mail", function(request, response){
  var token = getValueFromCookie('app-token', request.headers.cookie);
  console.log("Token found in cookie: ", token);
  var email = getValueFromCookie('app-email', request.headers.cookie);
  console.log("Email found in cookie: ", email);
  if (token) {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<div><h1>Your Inbox</h1></div>");

    var queryParams = {
      '$select': 'Subject,ReceivedDateTime,From',
      '$orderby': 'ReceivedDateTime desc',
      '$top': 10
    };

    // Set the API endpoint to use the v2.0 endpoint
    outlook.base.setApiEndpoint('https://outlook.office.com/api/v2.0');
    // Set the anchor mailbox to the user's SMTP address
    outlook.base.setAnchorMailbox(email);

    outlook.mail.getMessages({token: token, odataParams: queryParams},
      function(error, result){
        if (error) {
          console.log('getMessages returned an error: ' + error);
          response.write("<p>Error: " + error + "</p>");
          response.end();
        }
        else if (result) {
          console.log('getMessages returned ' + result.value.length + ' messages.');
          response.write('<table><tr><th>From</th><th>Subject</th><th>Received</th></tr>');
          result.value.forEach(function(message){
            console.log(' Subject: ' + message.Subject);
            var from = message.From ? message.From.EmailAddress.Name : "NONE";
            response.write('<tr><td>' + from + '</td><td>' + message.Subject +
            '</td><td>' + message.ReceivedDateTime.toString() + '</td></tr>');
          });

          response.write('</table>');
          response.end();
        }
      });
  }
  else {
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write("<p>No token found in cookie!</p>");
    response.end();
  }
});
