// jQuery Plugin Boilerplate
(function($) {
	
	
	// plugin's default options
	var defaults = {
		
		tableName:"",
		columns: [],
		
		//AWS Config
		config: {
			apiVersion: "2012-08-10",
			accessKeyId: "",
			secretAccessKey: "",
			region: "us-east-2"
		},
		
		// if your plugin is event-driven, you may provide callback capabilities
		// for its events. execute these functions before or after events of your
		// plugin, so that users may customize those particular events without
		// changing the plugin's code
		onFoo: function() {}
		
	}
	
	
	// this will hold the merged default, and user-provided options
	settings = {}
	
	var $element = $(element), // reference to the jQuery version of DOM element
	element = element; // reference to the actual DOM element
	
	// the "constructor" method that gets called when the object is created
	var init = function(containerID,options) {
		
		settings = $.extend({}, defaults, options);
		
		//var elementID = $element.attr("id");
		//console.log(containerID);
		loadTable(containerID);
		loadTableData_AWS(containerID);
		
	}
	
	
	
	var loadTableData_AWS = function(containerID) {
		
		AWS.config.update(settings.config); 
		
		// Create the DynamoDB service object
		var ddb = new AWS.DynamoDB(settings.config);				
		
		
		const params = {
			// Specify which items in the results are returned.
			//FilterExpression: "Subtitle = :topic AND Season = :s AND Episode = :e",
			// Define the expression attribute value, which are substitutes for the values you want to compare.
			//ExpressionAttributeValues: {
			//":topic": {S: "SubTitle2"},
			//":s": {N: 1},
			//":e": {N: 2},
			//},
			// Set the projection expression, which are the attributes that you want.
			//ProjectionExpression: "Season, Episode, Title, Subtitle",
			TableName: settings.tableName,
		};
		
		ddb.scan(params, function (err, data) {
			if (err) {
				//console.log("Error", err);
				} else {
				//console.log("Success", data);
				loadTableData(containerID,data);
			}
		});
		
		
	}
	
	
	var loadTableData = function(containerID,data) {
		
		var controlsHTML = "<td><i title='Edit Row' class='fa fa-edit dpt-edit' ></i>&nbsp;<i title='Delete Row' class='fa-regular fa-circle-xmark dpt-remove' ></i>&nbsp;<i title='Save Row' class='fa-regular fa-floppy-disk dpt-save' ></i></td>";
		
		$dynamoTable = $("#dpt-"+containerID);
		$dynamoTable.find("tr.dpt-loading").remove();
		$dynamoTableHeader = $dynamoTable.find("tr.dpt-header");
		
		var rowItemHTML="";
		
		data.Items.forEach(function (element, index, array) {
			
			rowItemHTML="";
			
			settings.columns.forEach(function (columnName) {
				rowItemHTML += "<td>"+element[columnName].S+"</td>";								
			});
			
			rowItemHTML = "<tr>"+rowItemHTML+controlsHTML+"</tr>";
			
			$dynamoTableHeader.after(rowItemHTML);
		});
		
	}
	
	
	var loadTable = function(containerID) {
		
		var tableHTML = "<table id='dpt-"+containerID+"' class='dpt-table' border='1'></table>";
		
		$container = $("#"+containerID);
		$container.append(tableHTML);
		
		var columnCount = settings.columns.length;
		
		var tableHeaderHTML = "";
		var tableLoadingHTML = "";
		var tableAddItemHTML = "";
		var tableControlsHTML = "";
		
		
		$dynamoTable = $("#dpt-"+containerID);
		
		settings.columns.forEach(function (columnName) {
			tableHeaderHTML += "<th>"+columnName+"</th>";
			tableAddItemHTML += "<td><input type='text' class='dpt-input' id='dpt-input-"+columnName+"' placeholder='"+columnName+"'></td>";
			
			if(tableLoadingHTML=="") {
				tableLoadingHTML += "<td>Loading...</td>";
				} else {
				tableLoadingHTML += "<td></td>";
			}
			
		});
		
		tableHeaderHTML = "<tr class='dpt-header' >"+tableHeaderHTML+"<th>Controls</th></tr>";
		tableLoadingHTML = "<tr class='dpt-loading'>"+tableLoadingHTML+"<td></td></tr>";
		tableAddItemHTML = "<tr class='dpt-adder'>"+tableAddItemHTML+"<td><button class='dpt-add-button' id='dpt-add-"+containerID+"' >Add</button></td></tr>";
		
		
		$dynamoTable.append(tableHeaderHTML);
		$dynamoTable.append(tableLoadingHTML);
		$dynamoTable.append(tableAddItemHTML);
		
		
		
		
		
	}
	
	
	
	
	var addItem_AWS = function (containerID) {
		
		var i=0;
		var dpt_input = [];
		
		
		var params = {
			TableName: 'Inventory',
			Item: {
				
			}
		};
		
		
		
		settings.columns.forEach(function (columnName) {
			dpt_input[i] = $("#dpt-input-"+settings.columns[i]).val(); 
			//console.log(dpt_input[i]);
			params.Item[columnName] = {S:dpt_input[i]};
			
			i++;
		});
		
		//console.log(params);
		
		
		AWS.config.update(settings.config); 
		
		// Create the DynamoDB service object
		var ddb = new AWS.DynamoDB(settings.config);
		
		
		
		
		ddb.putItem(params, function (err, data) {
			if (err) {
				//console.log("Error", err);
				} else {
				//console.log("Success", data);
				$dynamoTable = $("#dpt-"+containerID);
				$dynamoTableAdder = $dynamoTable.find("tr.dpt-adder");
				
				var dynamoAddRowHTML = ""; var i=0;
				settings.columns.forEach(function (columnName) {
					//dpt_input[i] = $("#dpt-input-"+settings.columns[i]).val(); 
					//console.log(dpt_input[i]);
					dynamoAddRowHTML += "<td>"+dpt_input[i]+"</td>";
					i++;
				});
				
				dynamoAddRowHTML = "<tr>"+dynamoAddRowHTML+"<td></td></tr>";
				$dynamoTableAdder.before(dynamoAddRowHTML);
				$(".dpt-input").val("");
			}
		});
		
		
	}
	
	
	
	var removeItem_AWS = function(removeElement,containerID) {
		
		var i=0;
		var dpt_input = [];
		
		var primaryColumn = settings.columns[0];
		var sortColumn = settings.columns[1];
		
		
		$removeRow = $(removeElement).parents("tr");
		var removePrimaryKey = $removeRow.children("td:first").text();
		var removeSortKey = $removeRow.children("td:nth-child(2)").text();
		
		
		var params = {
			TableName: 'Inventory',
			Key: {
				
			}
		};
		
		params.Key[primaryColumn] = {S:removePrimaryKey};
		params.Key[sortColumn] = {S:removeSortKey};
		
		
		//console.log(params);
		
		
		AWS.config.update(settings.config); 
		
		// Create the DynamoDB service object
		var ddb = new AWS.DynamoDB(settings.config);
		
		
		
		
		ddb.deleteItem(params, function (err, data) {
			if (err) {
				//console.log("Error", err);
				} else {
				//console.log("Success", data);
				$dynamoTable = $("#dpt-"+containerID);
				
				$removeRow.remove();
				
			}
		});
		
		
	}
	
	
	var editItem = function(editElement,containerID) {
		
		var columnData;
		
		$editRow = $(editElement).parents("tr");
		
		$editRow.children('td').each(function(i) { 
			if(!$(this).is(':last-child')) {
				columnData = $(this).text();
				$(this).html("<input class='dpt-input' type='text' value='"+columnData+"' />");
			}
		});
		
		$deleteElement = $(editElement).siblings("i.dpt-remove");
		$(editElement).hide();
		$deleteElement.hide();
		
		
	}
	
	
	
	var saveItem_AWS = function (saveElement,containerID) {
		
		var i=0;
		var dpt_input = [];
		
		var primaryColumn = settings.columns[0];
		var sortColumn = settings.columns[1];
		
		
		$saveRow = $(saveElement).parents("tr");
		var savePrimaryKey = $saveRow.children("td:first").children("input.dpt-input").val();
		var saveSortKey = $saveRow.children("td:nth-child(2)").children("input.dpt-input").val();
		
		
		var params = {
			TableName: 'Inventory',
			Key: {
				
			},
			AttributeUpdates: {}
		};
		
		params.Key[primaryColumn] = {S:savePrimaryKey};
		params.Key[sortColumn] = {S:saveSortKey};
		
		var columnIndex, columnData;
		
		$saveRow.children('td').each(function(i) { 
			if(!$(this).is(':last-child') && !$(this).is(':first-child') && !$(this).is(':nth-child(2)')) {
				columnIndex = $(this).index();
				columnData = $(this).children("input.dpt-input").val();
				columnName = settings.columns[columnIndex];
				
				//console.log(columnData +" "+columnIndex+" "+columnName);
				
				params.AttributeUpdates[columnName]={Action:'PUT',Value:{S:columnData}};
			}
		});
		
		
		
		
		
		
		//console.log(params);
		
		
		AWS.config.update(settings.config); 
		
		// Create the DynamoDB service object
		var ddb = new AWS.DynamoDB(settings.config);
		
		
		
		
		ddb.updateItem(params, function (err, data) {
			if (err) {
				//console.log("Error", err);
				} else {
				//console.log("Success", data);
				$dynamoTable = $("#dpt-"+containerID);
				
				$saveRow.children('td').each(function(i) { 
					if(!$(this).is(':last-child')) {
						columnData = $(this).children("input.dpt-input").val();
						$(this).html(columnData);
					}
				});
				
				$deleteElement = $(saveElement).siblings("i.dpt-remove");
				$editElement = $(saveElement).siblings("i.dpt-edit");
				$editElement.show();
				$deleteElement.show();
				
				
			}
		});
		
		
	}
	
	
	// add the plugin to the jQuery.fn object
	$.fn.liveEditTable = function(options) {
		
		
		var containerID = $(this).attr("id");
		init(containerID,options);
		
		// iterate through the DOM elements we are attaching the plugin to
		return this.each(function() {
			
			
			// if plugin has not already been attached to the element
			if (undefined == $(this).data('liveEditTable')) {
				
				
				$(this).on('click','.dpt-edit', function(){
					editItem(this,containerID);
				});
				
				$(this).on('click','.dpt-remove', function(){
					removeItem_AWS(this,containerID);
				});
				
				$(this).on('click','.dpt-save', function(){
					saveItem_AWS(this,containerID);
				});
				$(this).on('click','.dpt-add-button', function(){
					addItem_AWS(containerID);
				});
				
				
				
			}
			
		});
		
	}
	
})(jQuery);
