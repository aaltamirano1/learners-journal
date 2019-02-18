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
function formatSingleDigit(num){
	if (num<10){
		return "0"+(num);
	}
	return num;
}

function formatDate(jsonDate){
	const d = new Date(jsonDate);

	let month = formatSingleDigit(d.getMonth()+1);
	let day = formatSingleDigit(d.getDate()+1);

	return date = d.getFullYear()+"-"+month+"-"+day;
}

function setPlaceholders(entry){
	const date = formatDate(entry.date);
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
	getEntry(localStorage.entryId);
	watchEditForm();
});