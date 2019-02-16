function watchLogoutButton(){
	$('.logout-btn').on('click', function(){
		localStorage.clear();
		window.location = '/';
	});
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
	.then(res=> res.json)
	.then(data=>{
		console.log(data);
		location.replace("/index.html");
	});
}

function watchForm(){
	$('#new-entry').submit(function(e){
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
	watchForm();
	watchLogoutButton();
});