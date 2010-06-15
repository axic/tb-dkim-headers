#/bin/sh

# If anyone knows an easier way, don't hesitate to tell :)
VERSION=`grep -e "<em:version>\(.*\)<\/em:version>" install.rdf | sed "s/.*<em:version>\(.*\)<\/em:version>.*/\1/"`

rm -f tb-dkim-headers-$VERSION.xpi
zip -9 -r tb-dkim-headers-$VERSION.xpi install.rdf chrome.manifest content/
