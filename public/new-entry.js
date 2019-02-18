function watchLogoutButton(){
	$('.logout-btn').on('click', function(){
		localStorage.clear();
		window.location = '/';
	});
}

function displayError(){
	$("form h1").after(`<p class="error">There was a problem with one or more off your fields. Please make sure no fields are empty.</p>`);
}

function postEntry(entry){
	fetch("/entries", {
		method: "POST",
		body: JSON.stringify(entry),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer '+localStorage.authToken
		}
	})
	.then(res=> {
		if(res.ok){
			return res.json;
		}
		throw new Error(res.statusText);
	})
	.then(data=>{
		console.log(data);
		location.replace("/index.html");
	})
	.catch(err=>{
		displayError();
		console.log(err);
	});
}

function watchNewEntryForm(){
	$('#new-entry').submit(function(e){
		$(".error").remove();
		e.preventDefault();
		let date = $("#date-input").val();
		let workingOn = $("#working-on-input").val();
		let feelings = $("#feelings-input").val();
		let lookingForward = $("#looking-forward-input").val();
		postEntry({
			date,
			workingOn,
			feelings,
			lookingForward,
			user: localStorage.authToken
		});
	});
}

$(()=>{
	watchNewEntryForm();
	watchLogoutButton();
});