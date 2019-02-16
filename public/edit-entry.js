function updateEntry(entry){
	fetch(`/entries/${localStorage.editId}`, {
		method: "PUT",
		body: JSON.stringify(entry),
		headers: {
			'Content-Type': 'application/json'
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

function watchEditForm(){
	$('#edit-entry').submit(function(e){
		e.preventDefault();
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

	});
}
function formatDate(jsonDate){
	const d = new Date(jsonDate);

	let month = d.getMonth()+1;
	if (month<10){
		month = "0"+(month);
	}
	return date = d.getFullYear()+"-"+(month)+"-"+d.getDate();
}

function setPlaceholders(values){
	const json = JSON.parse(values);
	const date = formatDate(json.date);
	localStorage.editId = json._id;

	$("#date-input").val(date);
	$("#working-on-input").val(json.workingOn);
	$("#feelings-input").val(json.feelings);
	$("#looking-forward-input").val(json.lookingForward);
}


$(()=>{
	setPlaceholders(localStorage.edit);
	watchEditForm();
});