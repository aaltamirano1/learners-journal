function linkToLogin(){
	$('body').empty();
	$('body').append(`
		<main id="signup-success">
			<p>Signed up successfully! Go back to <a href="index.html">login</a>.</p>
		</main>
	`);
}

function displayError(err){
	$("form h1").after(`<p class="error">Issue with ${err.location}. ${err.message}.</p>`);
}

function postUser(user){
	fetch("/users", {
		method: "POST",
		body: JSON.stringify(user),
		headers: {
			'Content-Type': 'application/json'
		}
	}).then(res=>{
		return res.json();
	}).then(data=>{
		if(data.code){
			$('.error').remove();
			displayError(data);
		}else{
			console.log(data);
			linkToLogin();
		}
	});
}

function watchSignupForm(){
	$('#signup').submit(function(e){
		e.preventDefault();
		$('.error').remove();
		let username = $("#username-input").val();
		let password = $("#password-input").val();
		postUser({
			username,
			password
		});
	});
}

$(()=>{
	if(localStorage.authToken){
		// if logged in and player accesses this page, redirect to home page.
		location.replace("/index.html");
	}else{		
		watchSignupForm();
	}
});