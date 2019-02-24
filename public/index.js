function watchDeleteButton(){
	//unbind so click isnt triggered more than once.
	$('.delete').unbind('click').bind('click', function(e){
		const id = $(this).attr("data-entry-id");
		fetch(`/entries/${id}`, {
			method: "DELETE",
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer '+localStorage.authToken
			}
		}).then(res=>{
			const message = res.json.message ? ": "+res.json.message : "";
			console.log(`${res.status}${message}`);
			getEntries(localStorage.user_id);
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
	console.log(date);
	const day = parseInt(date.slice(8,10));
	const month = parseInt(date.slice(5,7))-1;
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
  return  `${months[month]} ${day}, ${date.slice(0,4)}`;
}

function displayEntry(entry){
	$('.entries').append(`
		<li>
 			<p class="date"><em>${formatDate(entry.date)}</em></p>
 			<h4>Working On:</h4> 
 			<p>${entry.workingOn}</p>
 			<h4>Feelings On It:</h4>
 			<p> ${entry.feelings}</p>
 			<h4>Looking Forward To:</h4>
 			<p>${entry.lookingForward}</p>
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
	$('nav').addClass('home-page-nav');
	$('nav').html(`
		<h1 class="nav-heading" id="home-page-heading">Learner's Journal</h1>
		<ul>
 	 		<li><a href="new-entry.html"><button>New Entry</button></a></li>
 	 		<li><a class="logout-btn" href="index.html"><button>Log Out</button></a></li> 		
 	 	</ul>`);
	watchLogoutButton();
}

function displayHomePage(data){
	changeNavLinks();
	$('#login').remove();
	$('main').fadeOut();
	$('body').append('<main><ul class="entries"></ul></main>');

	if(data.length===0){
		$('.entries').append("<li class='no-entries'><h3>You have no journal entries yet. Click new entry to get started.</h3>");
	} else{
		data.forEach(entry=>displayEntry(entry));
		watchEditButton();
		watchDeleteButton();		
	}
	
}

function displayError(){
	$('.entry').remove();
	$("form h1").after(`<p class="error">Problem with your login information. Please try again.</p>`);
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
			'Content-Type': 'application/json'
		}
	})
	.then(res=> res.json())
	.then(data=>{
		localStorage.authToken = data.authToken;
		console.log(data);
		getUserId(_user); 
	})
	.catch(err=>{
		console.error(err);
		$('form input').val("");

		displayError();
	});
}

function watchLoginForm(){
	$('#login').submit(function(e){
		$('.error').remove();
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
		// display home page
		getEntries(localStorage.user_id);
	}else{
		// display login page
		$('#landing').css('display', 'flex');
		watchLoginForm();
	}
});