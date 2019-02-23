function updateEntry(entry){
	fetch(`/entries/${localStorage.editId}`, {
		method: "PUT",
		body: JSON.stringify(entry),
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'Bearer '+localStorage.authToken
		}
	})
	.then(res=>res.json())
	.then(data=>{
		console.log('Entry updated.', data);
		location.replace("/index.html");
	})
	.catch(err=>{
		console.error(err);
	});
}

function displayError(){
	$("form h1").after(`<p class="error">There was a problem with one or more off your fields. Please make sure no fields are empty.</p>`);
}

function fieldIsEmpty(){
	return $('input').val() == "" || $('textarea').val() == "";
}

function watchEditForm(){
	$('#edit-entry').on('submit', function(e){
		$(".error").remove();
		e.preventDefault();
		if(fieldIsEmpty()){
			displayError();
		}else{
			let date = $("#date-input").val();
			let workingOn = $("#working-on-input").val();
			let feelings = $("#feelings-input").val();
			let lookingForward = $("#looking-forward-input").val();
			updateEntry({
				date,
				workingOn,
				feelings,
				lookingForward
			});
		}
	});
}

function setPlaceholders(entry){
	const date = entry.date.slice(0,10);
	localStorage.editId = entry._id;

	$("#date-input").val(date);
	$("#working-on-input").val(entry.workingOn);
	$("#feelings-input").val(entry.feelings);
	$("#looking-forward-input").val(entry.lookingForward);
}

function getEntry(id){
	fetch(`/entries/${id}`)
	.then(res=>{
    if (res.ok) {
      return res.json();
    }
    throw new Error(res.statusText);
	})
	.then(entry=>{
		setPlaceholders(entry);
	})
	.catch(err=>{
		console.error(err);
	});
}

$(()=>{
	if(localStorage.authToken){
		getEntry(localStorage.entryId);
		watchEditForm();
	}else{
		// if not logged in and player accesses this page, redirect to login.
		location.replace("/index.html");
	}
});