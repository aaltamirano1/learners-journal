function linkToLogin(){
	$('body').empty();
	$('body').append(`
		<main>
			<p>Signed up successfully! Go back to <a href="index.html">login</a></p>
		</main>
	`);
}

function displayError(err){
	$("h1").after(`<p class="error">Issue with ${err.location}. ${err.message}.</p>`);
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
			displayError(data);
		}else{
			console.log(data);
			linkToLogin();
		}
	});
}

function watchForm(){
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

$(watchForm);