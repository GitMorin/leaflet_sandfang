function getUserFromForm() {
  //event.preventDefault();
    const email = $('#email').val();
    const password = $('#password').val();

    const user = {
      email,
      password
    };
    return user;
  };

  function showErrorMessage(message) {
    //console.error(error);
    const $errorMessage = $('#errorMessage');
          $errorMessage.text(message);
          $errorMessage.show();
  }