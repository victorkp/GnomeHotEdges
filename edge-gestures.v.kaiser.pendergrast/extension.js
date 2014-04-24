const Clutter = imports.gi.Clutter;
const St = imports.gi.St;
const Meta = imports.gi.Meta;

const Lang = imports.lang;
const Main = imports.ui.main;

const HOT_AREA = 3;

const EDGE_TOP = 0;
const EDGE_LEFT = 1;
const EDGE_RIGHT = 2;
const EDGE_BOTTOM = 3;

// Keep track of the actors and their handler Ids so that listeners can be disconnected
let actors = [ ];
let handlers = [ ];

function _makeHotEdges(){
	// Top Hot Area to open overview
	let topArea = _makeEdgeActor(EDGE_TOP);
	var topHandler = topArea.connect('scroll-event', _toggleOverview);
	let topTouchHandler = topArea.connect('button-press-event', _showOverview);

	// Bottom Hot Area to open messaging tray
	let bottomArea = _makeEdgeActor(EDGE_BOTTOM);
	let bottomHandler = bottomArea.connect('scroll-event', _toggleMessageTray);
	let bottomTouchHandler = bottomArea.connect('button-press-event', _showMessageTray);

	// Right Hot Area to scroll workspaces
	let rightArea = _makeEdgeActor(EDGE_RIGHT);
	let rightHandler = rightArea.connect('scroll-event', _scrollWorkspaces);

	// Add the actors
	args = { };
	Main.layoutManager.addChrome(topArea, args);
	Main.layoutManager.addChrome(bottomArea, args);
	Main.layoutManager.addChrome(rightArea, args);

	// Save the actors
	actors.push(topArea);
	actors.push(topArea);
	actors.push(bottomArea);
	actors.push(bottomArea);
	actors.push(rightArea);

	// Save the handlers
	handlers.push(topHandler);
	handlers.push(topTouchHandler);
	handlers.push(bottomHandler);
	handlers.push(bottomTouchHandler);
	handlers.push(rightHandler);
}

function _disconnectHotEdges(){
	for(var i = 0; i < actors.length; i++){
		actors[i].disconnect(handlers[i]);
	}

	actors = [ ];
	handlers = [ ];
}

function _makeEdgeActor(edge){
	// Don't allow gesture on the upper left "Activities" corner
	var xOffsetLeft = 170;

	// Don't allow gesture on the upper right status/power icons
	var xOffsetRight = 145;

	// How many pixels high the top panel is 
	var yOffset = Main.panel.actor.height;


	var x = 0;
	var y = 0;
	var width = 0;
	var height = 0;

	var monitor = Main.layoutManager.primaryMonitor;

	switch(edge){
	case EDGE_TOP:
		x = xOffsetLeft;
		y = 0;
		width = monitor.width - xOffsetLeft - xOffsetRight;
		height = HOT_AREA;
		break;

	case EDGE_BOTTOM:
		x = 0;
		y = monitor.height - HOT_AREA;
		width = monitor.width;
		height = HOT_AREA;
		break;

	case EDGE_LEFT:
		x = 0;
		y = yOffset;
		width = HOT_AREA;
		height = monitor.height - yOffset;
		break;

	case EDGE_RIGHT:
		x = monitor.width - HOT_AREA;
		y = yOffset;
		width = HOT_AREA;
		height = monitor.height - yOffset;
		break;
	}

	var actor = new Clutter.Rectangle({
			name: 'edge_hot_area_'+edge,
			reactive: true,
			opacity: 0,
			x: x,
			y: y,
			width: width,
			height: height
	});

	return actor;
}

function _toggleOverview(actor, event){
	switch (event.get_scroll_direction()){
	case Clutter.ScrollDirection.UP:
		Main.overview.show();
		return true;

	case Clutter.ScrollDirection.DOWN:
		Main.overview.hide();
		return true;
	}

	return false;
}

function _showOverview(actor, event){
	Main.overview.show();
	return true;
}

function _toggleMessageTray(actor, event){
	switch (event.get_scroll_direction()){
	case Clutter.ScrollDirection.UP:
		Main.messageTray.hide();
		return true;

	case Clutter.ScrollDirection.DOWN:
		Main.messageTray.openTray()
		return true;
	}

	return false;
}

function _showMessageTray(){
	Main.messageTray.openTray()
	return true;
}

function _scrollWorkspaces(actor, event){
	switch (event.get_scroll_direction()){
	case Clutter.ScrollDirection.UP:
		switchWorkspace('switch-to-workspace-up');	
		return true;

	case Clutter.ScrollDirection.DOWN:
		switchWorkspace('switch-to-workspace-down');	
		return true;
	}

	return false;
}

/**
* Switches worspaces and shows the workspace switcher overlay. Uses
* non-public functions and may stop working.
*/
function switchWorkspace(binding_str) {
	let binding_obj = {
		get_name: function() {
			return binding_str;
		}
	}

	let add_switcher_handler = false;
	if (Main.wm._workspaceSwitcherPopup == null) {
		// Only add the scroll handler when the swichter gets created
		add_switcher_handler = true;
	}

	/* Shows the switcher and scrolls */
	Main.wm._showWorkspaceSwitcher(null, global.screen, null, binding_obj);

	let switcher = Main.wm._workspaceSwitcherPopup;
	if(switcher && add_switcher_handler) {
		this._addActor(switcher.actor, true, 'switcher');
	}
}

function init() {

}

function enable() {
	_makeHotEdges();
}

function disable() {
	_disconnectHotEdges();
}
