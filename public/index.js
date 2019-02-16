function watchDeleteButton(){
	//unbind so click isnt triggered more than once.
	$('.delete').unbind('click').bind('click', function(e){
		const id = $(this).attr("data-entry-id");
		fetch(`/entries/${id}`, {
			method: "DELETE",
			headers: {
				'Content-Type': 'application/json'
			}
		}).then(res=>{
			const message = res.json.message ? ": "+res.json.message : "";
			console.log(`${res.status}${message}`);
			window.location.reload();
		}).catch(err=>{
			console.error(err);
		});
	});
}

function watchEditButton(entry){
	$('.edit').unbind('click').bind('click', function(e){
		console.log(entry);
		localStorage.edit = JSON.stringify(entry);
		window.location.replace('/edit-entry.html');
	});
}

function buttonSection(id){
	return `
		<div class="button-box">
			<button data-entry-id="${id}" class="edit"><i class="fas fa-pencil-alt"></i></button>
			<button data-entry-id="${id}" class="delete"><i class="fas fa-trash-alt"></i></button>
		</div>
	`;
}

function formatDate(date){
	const newDate = new Date(date);
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  return  `${months[newDate.getMonth()]} ${newDate.getDate()}, ${newDate.getFullYear()}`;
}

function displayEntry(entry){
	$('.entries').append(`
		<li>
 			<p><em>${formatDate(entry.date)}</em></p>
 			<p><strong>Working on:</strong> ${entry.workingOn}</p>
 			<p><strong>Feelings on it: </strong> ${entry.feelings}</p>
 			<p><strong>Looking forward to:</strong> ${entry.lookingForward}</p>
 			${buttonSection(entry._id)}
 		</li>
	`);
	watchEditButton(entry);
	watchDeleteButton();
}

function watchLogoutButton(){
	$('.logout-btn').on('click', function(){
		localStorage.clear();
		window.location = '/';
	});
}

function changeNavLinks(){
	$('nav').empty();
	$('nav').html(`
		<h1>Learner's Journal</h1>
		<ul>
 	 		<li><a href="new-entry.html"><button>New Entry</button></a></li>
 	 		<li><a class="logout-btn" href="index.html"><button>Log Out</button></a></li>
 	 		<li><button>?</button></li>
 	 	</ul>`);
	watchLogoutButton();
}

function displayHomePage(data){
	changeNavLinks();
	$('#login').remove();
	$('body').append('<main><ul class="entries"></ul></main>');
	data.forEach(entry=>displayEntry(entry));
}

function displayError(){
	$('.entry').remove();
	$("h1").after(`<p class="error">Problem with your login information. Please try again.</p>`);
}

function getEntries(user_id){
	fetch(`/entries/${user_id}`, {
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
	});
}

function getUserId(user){
	fetch(`/users/id/${user.username}`)
	.then(res=>{
		if (res.ok) {
      return res.json();
    }
    throw new Error(res.statusText);
	})
	.then(user_id=>{
		localStorage.user_id = user_id;
		getEntries(user_id);
	}).catch(err=>{
		console.error(err);
	});
}

function getToken(user){
	let _user = user;
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
		getUserId(_user); 
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
	if(localStorage.authToken){
		getEntries(localStorage.user_id);
	}
	watchForm();
});