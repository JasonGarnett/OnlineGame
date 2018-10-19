var minWordSize = 3;
var letters = "";
var lettersIncluded = "";

function search(theseLetters) {
	letters = theseLetters;
	runSearch();
}

function setMinWordSize(size) {
	minWordSize = size;
	runSearch();
}

function setLettersIncluded(li) {
	lettersIncluded = li;
	runSearch();
}

function bold(word) {
	if (lettersIncluded.length > 0 && word.includes(lettersIncluded)) {
		return "<b>" + word + "</b>";
	} else {
		return word;
	}
}

function runSearch() {
	
	if (letters.length >= minWordSize) {
		console.log("Searching on " + letters + " min word size=" + minWordSize);
		$.get("/words/" + letters, { minWord: minWordSize },
			function(data, status) {
				var three = [];
				var four = [];
				var five = [];
				var six = [];
				var seven = [];
				
				for (x in data)  {
					var word = data[x];
					
					if (word.length === 3)
						three.push(bold(word));
					else if (word.length === 4)
						four.push(bold(word));
					else if (word.length === 5)
						five.push(bold(word));
					else if (word.length === 6)
						six.push(bold(word));
					else if (word.length === 7)
						seven.push(bold(word));
				}
				
				var info = "<table class=\"table table-bordered\"><th>3 letters (" + three.length + ")</th><th>4 letters (" + four.length + ")</th><th>5 letters (" + five.length + ")</th>" + 
							"<th>6 letters (" + six.length + ")</th><th>7 letters (" + seven.length + ")</th>";
				for (x in data) {
					if (three[x] || four[x] || five[x] || six[x] || seven[x]) {
						info += "<tr><td>" + ((three[x] == undefined)?"":three[x]) + "</td><td>" + ((four[x] == undefined)?"":four[x]) + "</td><td>" + 
						((five[x] == undefined)?"":five[x]) + "</td><td>" + ((six[x] == undefined)?"":six[x]) + "</td><td>" + ((seven[x] == undefined)?"":seven[x]) + "</td></tr>";
					}
				}	
				info += "</table>";
			
				$("#answer").html(info);
			}
		);
	} else {
		console.log("not enough characters");
	}
	
}