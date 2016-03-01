$(document).ready(function(){
  $("#search").on("click", function(e){
    e.preventDefault();
    var email = $(".emailField").val();
    $.ajax({
      url: "https://person.clearbit.com/v1/people/email/" + email,
      headers: {
        "Authorization": "Bearer " + env.clearbitToken
      },
      type: "GET",
      dataType: "json",
    }).done(function(response){
      console.log(response);
      $(".avatar").append("<img src=" + response.avatar +">");
    }).fail(function(){
      console.log("Get request failed");
    });
  });
});
