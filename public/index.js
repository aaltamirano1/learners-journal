function changeNavLinks(){
	$('nav').empty();
	$('nav').html(`
		<ul>
 	 		<li><button>New Entry</button></li>
 	 		<li><button>Log Out</button></li>
 	 		<li><button>?</button></li>
 	 	</ul>`);
}

function displayEntry(entry){
	$('.entries').append(`
		<li>
 			<p><em>${entry.date}</em></p>
 			<p><strong>Working on:</strong> ${entry.workingOn}</p>
 			<p><strong>Feelings on it: </strong> ${entry.feelings}</p>
 			<p><strong>Looking forward to:</strong> ${entry.lookingForward}</p>
 		</li>
	`);
}

function displayHomePage(json){
	changeNavLinks();
	$('#login').remove();
	$('body').append('<main><ul class="entries"></ul></main>');
	json.data.forEach(entry=>displayEntry(entry));
}

function displayError(){
	$("h1").after(`<p class="error">Problem with your login information. Please try again.</p>`);
}

function getToken(user){
	fetch("/auth/login", {
		method: "post",
		body: JSON.stringify(user),
		headers: {
			"content-type": "application/json"
		}
	}).then(res=>{
		return res.json();
	}).then(data=>{
		localStorage.authToken = data.authToken;
		getEntries();
	})
}

function getEntries(){
	fetch("/entries", {
		headers: {
			"Authorization": "Bearer "+localStorage.authToken
		}
	})
	.then(res=>{
    if (res.ok) {
      return res.json();
    }
    throw new Error(res.statusText);
	}).then(resJson=>{
		displayHomePage(resJson);
	}).catch(err=>{
		displayError();
		console.error(err);
	})
}

function watchForm(){
	$('#login').submit(function(e){
		e.preventDefault();
		let username = $("#username-input").val();
		let password = $("#password-input").val();
		getToken({
			username,
			password
		});
	});
}

$(()=>{
	watchForm();
});