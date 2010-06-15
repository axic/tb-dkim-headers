//
// Thunderbird DKIM headers extension
//
// Copyright (c) 2010 Alex Beregszaszi
// Kindly sponsored by Datira, a professional hosting company.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.
//
// Based on https://developer.mozilla.org/en/Extensions/Thunderbird/customDBHeaders_Preference
//
// Header fields: http://testing.dkim.org/documentation.html
// Sameple: 'Authentication-Results: mail.datira.com; dkim=pass (1024-bit key) header.i=@gmail.com header.b=wP1ah6Uq; dkim-adsp=pass'

function dkim_parse_result(hdr) {
	var res = hdr.getStringProperty("authentication-results");
//	dump("parse_result= "+res+"\n");
	if (res == null)
		return "Unsigned";

	var dkim = res.match(/^.*dkim=([a-zA-Z]+).*$/m);
	if (dkim != null && dkim[1] != null) {
//		dump("dkim regexp match="+dkim[1]+"\n");
		switch (dkim[1].toLowerCase()) {
			case "pass":
				return "Valid";
			case "fail":
			case "invalid":
				return "Invalid";
			case "neutral":
			default:
				break;
		}
	}
	return "Unsigned";
}

var columnHandler = {
	getCellText: function(row, col) {
		var key = gDBView.getKeyAt(row);
		var hdr = gDBView.db.GetMsgHdrForKey(key);
		return dkim_parse_result(hdr);
	},
	getSortStringForRow: function(hdr) {
		return dkim_parse_result(hdr);
	},
	isString: function() {
		return true;
	},
	getCellProperties: function(row, col, props) {
	},
	getRowProperties: function(row, props) {
	},
	getImageSrc: function(row, col) {
		return null;
	},
	getSortLongForRow: function(hdr) {
		return 0;
	}
}

function addCustomColumnHandler() {
	gDBView.addColumnHandler("colDKIMStatus", columnHandler);
}

var CreateDbObserver = {
	observe: function(aMsgFolder, aTopic, aData) {
       addCustomColumnHandler();
    }
}

function doOnceLoaded() {
	// add mail header for db indexing
	var headerPrefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefService);
	var currentDBHeaders = headerPrefs.getCharPref('mailnews.customDBHeaders').split(' ');
	var found = false;
	for (var i in currentDBHeaders) {
		if (currentDBHeaders[i] == "authentication-results") {
			found = true;
			break;
		}
	}
	if (!found)
		headerPrefs.setCharPref('mailnews.customDBHeaders', currentDBHeaders.concat("authentication-results").join(' '));

	// add db callback
	var ObserverService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
	ObserverService.addObserver(CreateDbObserver, "MsgCreateDBView", false);

	// add column callback
	window.document.getElementById("folderTree").addEventListener("select", addCustomColumnHandler, false);
}

window.addEventListener("load", doOnceLoaded, false);
