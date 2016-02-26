$(document).ready(function() {
  $('button').on("click", function() {
    $('.photo-container').empty();
    var email = $('input').val();
    var url = "https://api.fullcontact.com/v2/person.json?email=" + email + "&apiKey=d5a1cf11e06700a2";
    $.ajax({
      url: url,
      success: function(data) {
        var photos = data.photos;
        if (data.photos !== undefined) {
          $.each(photos, function(index, photo) {
            $('.photo-container').append('<img src="' + photo.url + '"' + '>');
          });
        } else {
          $('.photo-container').append('<div class = no-photo><h2> Sorry, we could not find any photos</h2></div>');
        }

      }
    })

  })
})