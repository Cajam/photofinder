$(document).ready(function() {
  $('button').on("click", function() {
    var email = $('input').val();
    var url = "https://api.fullcontact.com/v2/person.json?email=" + email + "&apiKey=d5a1cf11e06700a2";
    $.ajax({
      url: url,
      success: function(data) {
        var photos = data.photos;
        $.each(photos, function(index, photo) {
          $('.photo-container').append('<img src="' + photo.url + '"' + '>');
        });
      }
    });
  })
})
