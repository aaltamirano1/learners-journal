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

function watchEditButton(){
	$('.edit').unbind('click').bind('click', function(e){
		let entryId = $(this).attr('data-entry-id');
		localStorage.entryId = entryId;
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
  return  `${months[newDate.getMonth()]} ${newDate.getDate()+1}, ${newDate.getFullYear()}`;
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
 	 		<li><div class="dropdown">
        <button class="dropdown-btn">?</button>
        <div class="dropdown-content">
          <h4>Welcome to your Learner's Journal!</h4>
          <p>This is a journal for anyone who is trying to learn a new skill or improve on a skill. It is meant to provide a helpful way to track your progress. You may find it especially useful and encouraging to look back on things you struggled with at some point in the past.</p>
        </div>
      </div></li> 	 		
 	 	</ul>`);
	watchLogoutButton();
}

function displayHomePage(data){
	changeNavLinks();
	$('#login').remove();
	$('body').append('<main><ul class="entries"></ul></main>');
	data.forEach(entry=>displayEntry(entry));
	watchEditButton();
	watchDeleteButton();
}

function displayError(){
	$('.entry').remove();
	$("h1").after(`<p class="error">Problem with your login information. Please try again.</p>`);
}

function getEntries(user_id){
	fetch(`/entries/by-user/${user_id}`, {
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

function watchLoginForm(){
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
	watchLoginForm();
});