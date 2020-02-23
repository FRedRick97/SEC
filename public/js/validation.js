$(function () {
    $.validator.setDefaults({
        errorClass: 'error-text',
        highlight: function (element) {
            $(element)
                .closest('.validate')
                .addClass('form-error');
        },
        unhighlight: function (element) {
            $(element)
                .closest('.validate')
                .removeClass('form-error');
        },
        errorPlacement: function (error, element) {
            error.insertAfter(element);
        }
    });
    $('#signup-form').validate({
        rules: {
            email: {
                required: true,
                email: true
            },
            name: {
                required: true,
                minlength: 3
            },
            password: {
                required: true,
                minlength: 5
            },
            confirm: {
                required: true,
                minlength: 5,
                equalTO: "#signup-pass-input"
            },
            address: {
                required: true
            },
            phone: {
                required: false
            }
        },
        messages: {
            email: {
                required: "This field is required."
            },
            name: {
                required: "This field is required."
            }
        }
    });
});
