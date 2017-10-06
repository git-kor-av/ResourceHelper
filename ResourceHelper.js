on('chat:message', function(msg) {
// ROLL LISTENER
    if(msg.playerid.toLowerCase() != "api" && msg.rolltemplate) {
        var cname = ((msg.content.split("{{charname=")[1]||'').split("}}")[0]||'');
        var character = cname ? findObjs({name: cname, type: 'character'})[0] : undefined;
        if(["traits"].indexOf(msg.rolltemplate) > -1) {
            handleresource(msg,character);
        }
    }
});

// check for matching resource/trait names and decrement resource value with a match
var handleresource = function (msg,character) {
    var traitName = ((msg.content.split("{{name=")[1]||'').split("}}")[0]||''),
        resources = filterObjs(function(o) {
            return o.get('type') === 'attribute' && o.get('characterid') === character.id && o.get('name').match(/resourc\S+_name/);
        });

    var rmatch = _.filter(resources, function(r) {return r.get('current') === traitName});
    
    if(_.isEmpty(rmatch)) {
        return;
    }

    var rtype = rmatch[0].get('name').replace('_name', '');
    var rname = findObjs({type: 'attribute', characterid: character.id, name: rtype}, {caseInsensitive: true})[0];
    
    if (!rname) {
        return;
    }
    
    decrementresource(msg, rname, character);
};

var decrementresource = function (msg, rname, character) {
    if(rname.get("current") ==="" || rname.get("max")===""){
        log("Resource " + rname.get("name") + " current or max value is null!");
    }
    
    var curUses = parseInt(rname.get("current"));
    var newUses = curUses - 1;
    
    if(curUses === 0) {
        sendChat(msg.who, "<div class='sheet-rolltemplate-simple' style='margin-top:-7px;'><div class='sheet-container'><div class='sheet-label' style='margin-top:5px;'><span>" + character.get("name") + " has no uses of this trait remaining." + "</span></div></div></div>");
    } else {
        rname.set({current: newUses});
    }
};