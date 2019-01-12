const GAME_START_EVENT = "gamestart",
	  GAME_STOP_EVENT = "gamestop";

class Game extends EventEmiter {
	constructor() {
		super();
		
		this.gui = new GameUI(this);
		this.resLoad = this._loadResources();
		
		//toate chain-urile de blocuri create vor fi adaugate aici 
		this.codeChains = [];
		
		this.DEBUGGING_CODE_CHAIN = false;
		this.DEBUGGING_DRAG_AND_DROP = false;
		
		this._addCustomListeners();
	}
}

_p = Game.prototype;

_p._loadResources = function() {
	var resLoad = new ResourceLoader(),
		self = this;
	
	resLoad.addEventListener("loadedJohnny", function(e) { drawChara(e.detail); });
	resLoad.addEventListener("loadedCodeBlocksXML", function(e) { self.gui.insertCodeBlocks(e.detail.responseXML); });
	resLoad.addEventListener("loadedCodeBlocksXML", this._boxCodeBlocks);
	resLoad.addEventListener("loadedCompatibilityJSON", this._setCodeBlocksCompatibility);
	resLoad.addEventListener("loadedSelectorsJSON", this._setCodeBlocksSelectors);

	resLoad.add(RESOURCES);
	resLoad.load();
	
	return resLoad;
}

/*
	parcurg toate listele de blocuri de cod si le wrappuiesc in obiect-ul codeblock
	ne folosim de regexp pentru a gasi categoria din care face parte un bloc
*/
_p._boxCodeBlocks = function() {
	var elem, currList, blocks, lists = ["codeflow_list", "events_list", "actions_list"],
		regExps = [/loop/, /action/, /conditional/, /event/, /expression/, /stop/],
		category = ["loop", "action", "conditional", "event", "expression", "stop"];
	
	for (var listId of lists) {
		currList = document.getElementById(listId);
		
		blocks = currList.querySelectorAll("li>div.code_block");
		
		for (var i = 0; i < blocks.length; i++)
			for (var j = 0; j < regExps.length; j++) {
				if (blocks[i].className.match(regExps[j]) != null)
					new CodeBlock(blocks[i], category[j]);
			}
	}
}

_p._setCodeBlocksSelectors = function(e) {
	var xhttp = e.detail;
	
	CodeChain.SELECTORS = JSON.parse(xhttp.responseText);
}

_p._setCodeBlocksCompatibility = function(e) {
	var xhttp = e.detail;
	
	CodeBlock.COMPATIBILITY_RULES = JSON.parse(xhttp.responseText);
}

_p._addCustomListeners = function() {
	this.on(GAME_START_EVENT, this._startGame);
}

_p.startDebuggingCodeChain = function() {
	this.DEBUGGING_CODE_CHAIN = true;
}

_p.startDebuggingDragAndDrop = function() {
	this.DEBUGGING_DRAG_AND_DROP = true;
}

_p._startGame = function() {
	for (var codeChain of this.codeChains) {
		codeChain.parseTree();
		codeChain.emit(GAME_START_EVENT, null);
	}
}