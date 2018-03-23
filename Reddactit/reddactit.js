if (redacted === null) {
    var redacted = false;
}

if (OP === null) {
    var OP = "";
}

function hashCode(str) {
    var hash = 0;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
        char = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash;
    }
    return hash;
}

function intToRGB(i) {
    var c = (i & 0x00FFFFFF)
    .toString(16)
    .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function hasSomeParentTheClass(element, classname) {
    if (!element.parentNode)
        return false;
    if (element.className.split(" ").indexOf(classname) >= 0)
        return true;
    return hasSomeParentTheClass(element.parentNode, classname);
}

function redactUsernames() {
    var x = document.getElementsByClassName("author");
    var i;
    for (i = 0; i < x.length; i++) {
        var userName = x[i].innerHTML.toLowerCase();
		var color = "#" + intToRGB(hashCode(userName));
        x[i].style.setProperty("color", "rgba(0, 0, 0, 0)", "important");
        x[i].style.setProperty("background-color", color, "important");
        if (x[i].classList.contains("submitter") || hasSomeParentTheClass(x[i], "top-matter")) {
			OP = userName;
            x[i].style.setProperty("box-shadow", "inset 0 0 0 2px blue", "important");
            x[i].style.setProperty("border-radius", "3px", "important");
            x[i].style.setProperty("outline", "1px solid black", "important");
            x[i].style.setProperty("outline-offset", "-3px", "important");
        }
		x[i].setAttribute("redacted","");
    }
}

function redactMentions() {
	var x = document.getElementsByTagName("a");
    var i;
    for (i = 0; i < x.length; i++) {
		if (/\/u\/[a-zA-Z0-9-_]{3,30}$/.test(x[i].href)) {
			var userName = x[i].innerHTML.split("u/").pop().toLowerCase();
			var color = "#" + intToRGB(hashCode(userName));
			x[i].style.setProperty("color", "rgba(0, 0, 0, 0)", "important");
			x[i].style.setProperty("background-color", color, "important");
			if (userName == OP) {
				x[i].style.setProperty("box-shadow", "inset 0 0 0 2px blue", "important");
				x[i].style.setProperty("border-radius", "3px", "important");
				x[i].style.setProperty("outline", "1px solid black", "important");
				x[i].style.setProperty("outline-offset", "-3px", "important");
			}
			x[i].setAttribute("redacted","");
		}
	}
}


function restoreUsernames() {
    var x = document.getElementsByTagName("a");
    var i;
    for (i = 0; i < x.length; i++) {
		if (x[i].hasAttribute("redacted")) {
			var userName = x[i].innerHTML.split("u/").pop().toLowerCase();
			x[i].style.removeProperty("color");
			x[i].style.removeProperty("background-color");
			if (userName == OP) {
				x[i].style.removeProperty("box-shadow");
				x[i].style.removeProperty("border-radius");
				x[i].style.removeProperty("outline");
				x[i].style.removeProperty("outline-offset");
			}
			x[i].removeAttribute("redacted");
		}
    }
}

function run() {
    if (redacted === false) {
        redactUsernames();
		redactMentions();
		redacted = true;
    } else if (redacted === true) {
        restoreUsernames();
		redacted = false;
    }
}

run();
