// JavaScript Document

var invoiceDAO = {listBySalesrep:listInvoicesBySalesrep, 
				listByCustomer:listInvoicesByCustomer,
				listToUpload:listInvoicesToUpload,
				getById:getInvoiceById, 
				store:storeInvoice, 
				deleteAll:deleteAllInvoices, 
				markToSync:markToSyncInvoice, 
				markSynchronized:doMarkSynchorinizedInvoice,
				generateRefNum:doGenerateRefNum
			};
var filterDataInvoice;
var invoiceReceiveFunction;
var invoiceReceiveListFunction;
var invoiceErrFunc;
var invoiceVO;
var recordInvoice;
var includeInvoiceDetails;
var invoiceOrigin;

//----------------------
//metodos hacia afuera
//----------------------

function doGenerateRefNum(prefix){
	var date = new Date();
	var toReturn = prefix + (date.getFullYear()+"").substring(2) + "" + (date.getMonth()+1) + "" + date.getDate();
	var plantilla = 'xxxxxxxxxxx'.substring(toReturn.length);
	toReturn += plantilla.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
    toReturn = toReturn.toUpperCase();
	return toReturn;
}

function getInvoiceById(aId,includeDetail,aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("getInvoice db=" + db);
	filterDataInvoice=aId;
	invoiceReceiveFunction = aReceiveFunction;
	includeInvoiceDetails = includeDetail;
	invoiceErrFunc = aErrFunc;
	db.transaction(doSelectInvoice, invoiceErrFunc);
}

function listInvoicesBySalesrep(salesrep_ListID, aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listInvoices db=" + db);
	invoiceReceiveListFunction = aReceiveFunction;
	invoiceErrFunc = aErrFunc;
	filterDataInvoice = salesrep_ListID;
	db.transaction(doSalesrepInvoices, invoiceErrFunc);
}

function listInvoicesByCustomer(customer_ListID, aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listInvoices db=" + db);
	invoiceReceiveListFunction = aReceiveFunction;
	invoiceErrFunc = aErrFunc;
	filterDataInvoice = customer_ListID;
	db.transaction(doCustomerInvoices, invoiceErrFunc, invoiceLocalListReceiveFunction);
}

function listInvoicesToUpload(aReceiveFunction,aErrFunc){
	db = openDatabaseZoe();
	logZoe("listInvoicesToUpload db=" + db);
	invoiceReceiveListFunction = aReceiveFunction;
	invoiceErrFunc = aErrFunc;
	db.transaction(doListInvoicesToUpload, invoiceErrFunc);
}

function storeInvoice(records,aErrFunc,successCB, origin){
	db = openDatabaseZoe();
	logZoe("storeInvoice db=" + db);
	recordInvoice = records;
	invoiceErrFunc = aErrFunc;
	invoiceOrigin = origin;
	db.transaction(doStoreInvoice, errorCB, successCB);
}

function deleteAllInvoices(aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("deleteAllInvoice db=" + db);
	invoiceErrFunc = aErrFunc;
	db.transaction(doDeleteAllInvoices, errorCB, successCB);
}

function markToSyncInvoice(id_invoice,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markToSyncInvoice db=" + db);
	customerErrFunc = aErrFunc;
	filterDataInvoice = id_invoice;
	db.transaction(doMarkToSyncInvoice, errorCB, successCB);
}

function markSynchronizedCustomer(id_invoice,aErrFunc,successCB){
	db = openDatabaseZoe();
	logZoe("markToSyncInvoice db=" + db);
	customerErrFunc = aErrFunc;
	filterDataInvoice = id_invoice;
	db.transaction(doMarkToSynchronizedInvoice, errorCB, successCB);
}


//----------------------
//metodos privados
//----------------------

function doSelectInvoice(tx){
	logZoe("doSelectInvoice filterData=" + filterDataInvoice);
	tx.executeSql("SELECT id_invoice, ListID, po_number, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal FROM invoice Where id_invoice = ?", [filterDataInvoice],invoiceLocalReceiveFunction, invoiceErrFunc);
}

function doSalesrepInvoices(tx){
	logZoe("doSelectSelesrepInvoices");
	tx.executeSql("SELECT id_invoice, ListID, po_number, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal, id_term FROM invoice WHERE id_salesrep = ?", [filterDataInvoice],invoiceLocalListReceiveFunction, invoiceErrFunc);
}

function doListInvoicesToUpload(tx){
	logZoe("doListInvoicesToUpload");
	tx.executeSql("SELECT invoice.*, invoice_item.* FROM invoice LEFT JOIN invoice_item ON invoice.id_invoice = invoice_item.id_invoice WHERE needSync = 1",[], invoiceLocalListToUploadReceiveFunction, invoiceErrFunc);
 }


function doCustomerInvoices(tx){
	logZoe("doSelectSelesrepInvoices");
	tx.executeSql("SELECT id_invoice, ListID, po_number, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal, id_term FROM invoice WHERE ListID = ?", [filterDataInvoice],invoiceLocalListReceiveFunction, invoiceErrFunc);
}

function invoiceLocalReceiveFunction(tx,results){
	logZoe("invoiceLocalReceiveFunction includeInvoiceDetails=" + includeInvoiceDetails);
	logZoe("invoiceLocalReceiveFunction results.rows=" + results.rows);
	logZoe("invoiceLocalReceiveFunction results.rows.length=" + results.rows.length);
	if (results.rows.length>0){
	logZoe("localReceiveFunction1 " + JSON.stringify(results.rows.item(0)));
		invoiceVO=results.rows.item(0);
			if (includeInvoiceDetails){
					tx.executeSql("SELECT LineID, id_invoice, Inventory_ListID, Desc, Quantity, Rate, Amount, SalesTax_ListID FROM invoice_item Where id_invoice = ?", [filterDataInvoice],invoiceItemsLocalReceiveFunction, invoiceErrFunc);
		
			}else{
				invoiceReceiveFunction(invoiceVO);
			}
	}
	logZoe("localReceiveFunction fin");
}

function invoiceItemsLocalReceiveFunction(tx,results){
	logZoe("invoiceItemsLocalReceiveFunction results = " + results);
	if (results && results.rows){
		logZoe("invoiceItemsLocalReceiveFunction results.rows.length = " + results.rows.length);
	}
	if (results && results.rows && results.rows.length>0){
		invoiceVO.items=new Array();
		var i;
		for (i = 0; i<results.rows.length; i++){
			logZoe("invoiceItemsLocalReceiveFunction lastItem=" + results.rows.item(i));
			invoiceVO.items[i] = results.rows.item(i);
		}
	}
	logZoe("invoiceItemsLocalReceiveFunction fin invoiceVO=" +  JSON.stringify(invoiceVO));
	invoiceReceiveFunction(invoiceVO);
}

function invoiceLocalListReceiveFunction(tx,results){
	logZoe("invoiceLocalListReceiveFunction results.length=" + results.rows.length);
	var i;
	arrayInvoices = new Array();
	for (i=0;i<results.rows.length;i++){
	logZoe("invoiceLocalListReceiveFunction " + JSON.stringify(results.rows.item(i)));
		arrayInvoices[i] = results.rows.item(i);
		invoiceReceiveListFunction(arrayInvoices);
	}
}

function invoiceLocalListToUploadReceiveFunction(tx,results){
	logZoe("invoiceLocalListToUploadReceiveFunction results.length=" + results.rows.length);
	var i;
	var indexInvoice=-1;
	var indexItem=0;
	var id_invoice_ant = "0";
	var arrayInvoices = new Array();
	var invoiceVO;
	for (i=0;i<results.rows.length;i++){
		var rec = results.rows.item(i)
		logZoe("invoiceLocalListToUploadReceiveFunction " + JSON.stringify(rec));
		if (id_invoice_ant != rec.id_invoice){
			indexInvoice += 1;
			indexItem = 0;
			invoiceVO = {
				id_invoice: rec.id_invoice,
				ListID: rec.ListID,
				po_number: rec.po_number,
				dueDate: rec.dueDate,
				appliedAmount: rec.appliedAmount,
				balanceRemaining: rec.balanceRemaining,
				billAddress_addr1: rec.billAddress_addr1,
				billAddress_addr2: rec.billAddress_addr2,
				billAddress_city: rec.billAddress_city,
				billAddress_state: rec.billAddress_state,
				billAddress_postalcode: rec.billAddress_postalcode,
				shipAddress_addr1: rec.shipAddress_addr1,
				shipAddress_addr2: rec.shipAddress_addr2,
				shipAddress_city: rec.shipAddress_city,
				shipAddress_state: rec.shipAddress_state,
				shipAddress_postalcode: rec.shipAddress_postalcode,
				isPaid: rec.isPaid,
				isPending: rec.isPending,
				refNumber: rec.refNumber,
				salesTaxPercentage: rec.salesTaxPercentage,
				salesTaxTotal: rec.salesTaxTotal,
				shipDate: rec.shipDate,
				subtotal: rec.subtotal,
				id_term: rec.id_term,
				billAddress_addr3: rec.billAddress_addr3,
				shipAddress_addr3: rec.shipAddress_addr3,
				zoeUpdateDate: rec.zoeUpdateDate,
				zoeSycDate: rec.zoeSycDate,
				needSync: rec.needSync,
				origin: rec.origin,
				items: new Array()
			}
			arrayInvoices[indexInvoice] = invoiceVO;
		}

		var invoiceItemVO = {
			  	LineID:rec.LineID,
  				id_invoice:rec.id_invoice,
				Inventory_ListID:rec.Inventory_ListID,
				Desc:rec.Desc,
				Quantity:rec.Quantity,
				Rate:rec.Rate,
				Amount:rec.Amount,
				SalesTax_ListID:rec.SalesTax_ListID
		}

		invoiceVO.items[indexItem] = invoiceItemVO;
		indexItem +=1;
	}
	invoiceReceiveListFunction(arrayInvoices);
}



function doGetInvoiceItems(tx){
	currentI += 1;
	if (currentI<arrayInvoices.length){
		var currentInvoice = arrayInvoices[i];
		tx.executeSql("SELECT LineID, id_invoice, Inventory_ListID, Desc, Quantity, Rate, Amount, SalesTax_ListID FROM invoice_item Where id_invoice = ?", [currentInvoice.id_invoice],invoiceItemLocalReceiveFunction, invoiceErrFunc);
	}
}

function invoiceItemLocalReceiveFunction(tx,results){

}

function doStoreInvoice(tx){
	logZoe ("doStoreInvoice ");
	if (recordInvoice.length){
		var i;
		for (i=0;i<recordInvoice.length;i++){
			var theRecord = recordInvoice[i];
			logZoe("store invoice:" + JSON.stringify(theRecord));
			doStoreOneInvoice(tx, theRecord);
		}
	}else{
			doStoreOneInvoice(tx, recordInvoice);
	}
	
}

function doStoreOneInvoice(tx, rec){
		tx.executeSql('INSERT OR REPLACE INTO invoice(id_invoice, ListID, po_number, dueDate, appliedAmount, balanceRemaining, billAddress_addr1, billAddress_addr2, billAddress_addr3, billAddress_city, billAddress_state, billAddress_postalcode, shipAddress_addr1, shipAddress_addr2, shipAddress_addr3, shipAddress_city, shipAddress_state, shipAddress_postalcode, isPaid, isPending, refNumber, salesTaxPercentage, salesTaxTotal, shipDate, subtotal, id_term) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',[rec.id_invoice, rec.ListID, ifUndefNull(rec.po_number), ifUndefNull(rec.dueDate), ifUndefNull(rec.appliedAmount), ifUndefNull(rec.balanceRemaining), ifUndefNull(rec.billAddress_addr1), ifUndefNull(rec.billAddress_addr2), ifUndefNull(rec.billAddress_addr3), ifUndefNull(rec.billAddress_city), ifUndefNull(rec.billAddress_state), ifUndefNull(rec.billAddress_postalcode), ifUndefNull(rec.shipAddress_addr1), ifUndefNull(rec.shipAddress_addr2), ifUndefNull(rec.shipAddress_addr3), ifUndefNull(rec.shipAddress_city), ifUndefNull(rec.shipAddress_state), ifUndefNull(rec.shipAddress_postalcode), ifUndefNull(rec.isPaid), ifUndefNull(rec.isPending), ifUndefNull(rec.refNumber), ifUndefNull(rec.TaxPercentage), ifUndefNull(rec.salesTaxTotal), ifUndefNull(rec.shipDate), ifUndefNull(rec.subtotal), ifUndefNull(rec.id_term)]);
		
	if (invoiceOrigin){
		tx.executeSql('UPDATE invoice set origin = ? WHERE id_invoice = ?',[invoiceOrigin,rec.id_invoice]);
	}

	
	 if (rec.items){
	 	console.log("storing invoice items")
		 for (var i=0;i<rec.items.length;i++){
			 var item = rec.items[i];
			 console.log("item=" + JSON.stringify(item));
			 console.log("elementos=" + JSON.stringify([item.LineID,item.id_invoice,item.inventory_ListID,item.Desc,item.Quantity,item.Rate,item.Amount,item.salesTax_ListID]));
			 tx.executeSql('INSERT OR REPLACE INTO invoice_item(LineID,id_invoice,Inventory_ListID,Desc,Quantity,Rate,Amount,SalesTax_ListID) VALUES(?,?,?,?,?,?,?,?)',[item.LineID,item.id_invoice,item.inventory_ListID,item.Desc,item.Quantity,item.Rate,item.Amount,item.salesTax_ListID]);
		 }
	 }
}

function doDeleteAllInvoices(tx){
	tx.executeSql('DELETE FROM invoice_item',[]);
	tx.executeSql('DELETE FROM invoice',[]);
}

function doMarkToSyncInvoice(tx){
	logZoe ("doMarkToSyncInvoice datafiler=" + filterDataInvoice);
	tx.executeSql("UPDATE invoice SET needSync=1, zoeUpdateDate=datetime('now', 'localtime') where id_invoice = ?",[filterDataInvoice]);
}

function doMarkSynchorinizedInvoice(tx){
	tx.executeSql("UPDATE invoice SET needSync=0, zoeSyncDate=datetime('now', 'localtime') where id_invoice = ?",[filterDataInvoice]);
}
