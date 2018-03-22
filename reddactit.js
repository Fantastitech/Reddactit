function hashCode(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function hasSomeParentTheClass(element, classname) {
    if (!element.parentNode) return false;
    if (element.className.split(' ').indexOf(classname)>=0) return true;
    return hasSomeParentTheClass(element.parentNode, classname);
}

var x = document.getElementsByClassName("author");
var i;
for (i = 0; i < x.length; i++) {
	var userName = x[i].innerHTML
	var color = "#" + intToRGB(hashCode(userName));
	x[i].style.setProperty("color", color, "important")
	x[i].style.setProperty("background-color", color, "important")
	if (x[i].classList.contains("submitter") || hasSomeParentTheClass(x[i], "top-matter")) {
		x[i].style.setProperty("outline", "3px solid blue", "important")
		x[i].style.setProperty("outline-offset", "-3px", "important")
	}
}