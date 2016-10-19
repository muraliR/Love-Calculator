App.controller('home', function (page) {

    $(page).delegate('.submit-button','click',function(){
        var male_name_input = $('input[name="male_name"]');
        var female_name_input = $('input[name="female_name"]');
        var male_name = male_name_input.val();
        var female_name = female_name_input.val();
        if(male_name.length == 0){
            App.dialog({
                text         : "Please Enter Your Name",
                okButton     : 'Got it!'
            });
            return false;
        }
        if(female_name.length == 0){
            App.dialog({
                text         : "Please Enter Your Partner Name",
                okButton     : 'Got it!'
            });
            return false;
        }

        $.ajax({
            url : '/calculate',
            type : 'GET',
            data : { male_name : male_name, female_name : female_name },
            beforeSend: function(){
                $('.loading').show();
                $('.submit-button').hide();
            },
            success : function(data){
                response_data = JSON.parse(data);
                match = response_data.result_data.match;
                flames = response_data.result_data.flames;

                var result_text = "<div><p>" + match.result + "</p>" + "<p>" + $(flames).text() + "</p></div>";
                App.dialog({
                    title        : match.result + "(" + match.percentage + "%)",
                    text         : $(flames).text(),
                    okButton     : 'Try Another'
                }, function (tryAgain) {
                  if (tryAgain) {
                    //$(male_name_input).val('');
                    $(female_name_input).val('');
                    $(female_name_input).focus();
                  }
                });
                $('.loading').hide();
                $('.submit-button').show();
            }
        });
    })

});

try {
    App.restore();
} catch (err) {
    App.load('home');
}
