﻿/*
Created: 29/04/2015
Modified: 23/06/2015
Model: RE SQLite 3.7
Database: SQLite 3.7
*/




-- Drop indexes section -------------------------------------------------

DROP INDEX IF EXISTS IX_VENDOR_NAME;
DROP INDEX IF EXISTS IX_Inventory_fullName;
DROP INDEX IF EXISTS IX_Relationship6;
DROP INDEX IF EXISTS IX_Inventory_salesDesc;
DROP INDEX IF EXISTS IX_invoice_lines;
DROP INDEX IF EXISTS IX_Relationship1;
DROP INDEX IF EXISTS IX_Relationship2;
DROP INDEX IF EXISTS IX_invoice_custumer;
DROP INDEX IF EXISTS IX_invoice_terms;
DROP INDEX IF EXISTS IX_INVOICE_SYNC;
DROP INDEX IF EXISTS IX_Relationship10;
DROP INDEX IF EXISTS IX_Relationship11;
DROP INDEX IF EXISTS customer_idx1;
DROP INDEX IF EXISTS IX_sales_rep_customer;
DROP INDEX IF EXISTS IX_Relationship3;
DROP INDEX IF EXISTS IX_Customer_Name;
DROP INDEX IF EXISTS IX_Relationship7;
DROP INDEX IF EXISTS IX_CUSTOMER_SYNC;
DROP INDEX IF EXISTS IX_Relationship12;
DROP INDEX IF EXISTS idx_salesrep_1;

-- Drop tables section ---------------------------------------------------

DROP TABLE IF EXISTS Vendor;
DROP TABLE IF EXISTS customer_msg;
DROP TABLE IF EXISTS pricelevel_item;
DROP TABLE IF EXISTS pricelevel;
DROP TABLE IF EXISTS invoice_item;
DROP TABLE IF EXISTS invoice;
DROP TABLE IF EXISTS customer;
DROP TABLE IF EXISTS salesrep;
DROP TABLE IF EXISTS Inventory;
DROP TABLE IF EXISTS term;
DROP TABLE IF EXISTS salesTax;

-- Create tables section -------------------------------------------------

-- Table salesTax

CREATE TABLE salesTax
(
  ListID TEXT NOT NULL,
  Name TEXT,
  desc TEXT,
  CONSTRAINT Key8 PRIMARY KEY (ListID)
);

-- Table term

CREATE TABLE term
(
  id_term TEXT NOT NULL,
  name TEXT,
  stdDueDays NUMERIC,
  stdDiscountDays NUMERIC,
  discountPct NUMERIC,
  CONSTRAINT Key6 PRIMARY KEY (id_term)
);

-- Table Inventory

CREATE TABLE Inventory
(
  ListID TEXT NOT NULL,
  FullName TEXT,
  InventorySite_ListID TEXT,
  QuantityOnHand NUMERIC,
  salesPrice NUMERIC,
  salesTax_ListID TEXT,
  salesDesc TEXT,
  CONSTRAINT Key7 PRIMARY KEY (ListID),
  CONSTRAINT Relationship6 FOREIGN KEY (salesTax_ListID) REFERENCES salesTax (ListID)
);

CREATE INDEX IX_Inventory_fullName ON Inventory (FullName);

CREATE INDEX IX_Relationship6 ON Inventory (salesTax_ListID);

CREATE INDEX IX_Inventory_salesDesc ON Inventory (salesDesc);

-- Table salesrep

CREATE TABLE salesrep
(
  id_salesrep TEXT NOT NULL,
  Name TEXT NOT NULL,
  Password TEXT NOT NULL,
  isActive INTEGER NOT NULL,
  SyncTime NUMERIC NOT NULL,
  initial TEXT,
  id_employee TEXT,
  CONSTRAINT Key2 PRIMARY KEY (id_salesrep),
  CONSTRAINT id_salesrep UNIQUE (id_salesrep)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_salesrep_1 ON salesrep (Name,isActive);

-- Table customer

CREATE TABLE customer
(
  ListID TEXT NOT NULL,
  FullName TEXT,
  IsActive INTEGER,
  billAddress1 TEXT,
  billAddress2 TEXT,
  shipAddress1 TEXT,
  shipAddress2 TEXT,
  openBalance NUMERIC,
  overdueBalance NUMERIC,
  workPhone TEXT,
  cellPhone TEXT,
  email TEXT,
  shipAddressZipcode TEXT,
  billAddresZipCode TEXT,
  billAddresCity TEXT,
  billAddressState TEXT,
  billAddressCountry TEXT,
  shipAddressCity TEXT,
  shipAddressState TEXT,
  shipAddressCountry TEXT,
  id_salesrep TEXT NOT NULL,
  routeDay1 INTEGER,
  routeDay2 INTEGER,
  routeDay3 INTEGER,
  routeDay4 INTEGER,
  routeDay5 INTEGER,
  routeDay6 INTEGER,
  routeDay7 INTEGER,
  Fax TEXT,
  companyName TEXT,
  billAddress3 TEXT,
  shipAddress3 NONE,
  name TEXT,
  otherDetails TEXT,
  id_term TEXT,
  zoeUpdateDate INTEGER,
  zoeSyncDate INTEGER,
  needSync INTEGER,
  pricelevel_ListID TEXT,
  origin TEXT,
  vendor_ListID TEXT,
  CONSTRAINT Key3 PRIMARY KEY (ListID),
  CONSTRAINT sales_rep_customer FOREIGN KEY (id_salesrep) REFERENCES salesrep (id_salesrep),
  CONSTRAINT Relationship3 FOREIGN KEY (id_term) REFERENCES term (id_term),
  CONSTRAINT Relationship7 FOREIGN KEY (pricelevel_ListID) REFERENCES pricelevel (ListID),
  CONSTRAINT Relationship12 FOREIGN KEY (vendor_ListID) REFERENCES Vendor (ListID)
);

CREATE INDEX customer_idx1 ON customer (FullName);

CREATE INDEX IX_sales_rep_customer ON customer (id_salesrep);

CREATE INDEX IX_Relationship3 ON customer (id_term);

CREATE INDEX IX_Customer_Name ON customer (FullName);

CREATE INDEX IX_Relationship7 ON customer (pricelevel_ListID);

CREATE INDEX IX_CUSTOMER_SYNC ON customer (needSync);

CREATE INDEX IX_Relationship12 ON customer (vendor_ListID);

-- Table invoice

CREATE TABLE invoice
(
  id_invoice TEXT NOT NULL,
  ListID TEXT NOT NULL,
  po_number TEXT,
  txnDate INTEGER,
  dueDate INTEGER,
  appliedAmount NUMERIC,
  balanceRemaining NUMERIC,
  billAddress_addr1 TEXT,
  billAddress_addr2 TEXT,
  billAddress_city TEXT,
  billAddress_state TEXT,
  billAddress_postalcode TEXT,
  shipAddress_addr1 TEXT,
  shipAddress_addr2 TEXT,
  shipAddress_city TEXT,
  shipAddress_state TEXT,
  shipAddress_postalcode TEXT,
  isPaid INTEGER,
  isPending INTEGER,
  refNumber TEXT,
  salesTaxPercentage NUMERIC,
  salesTaxTotal NUMERIC,
  shipDate INTEGER,
  subtotal NUMERIC,
  id_term TEXT,
  billAddress_addr3 TEXT,
  customerMsg_ListID TEXT,
  shipAddress_addr3 TEXT,
  memo TEXT,
  zoeUpdateDate INTEGER,
  zoeSycDate INTEGER,
  needSync INTEGER,
  origin TEXT,
  id_salesrep TEXT,
  CONSTRAINT Key4 PRIMARY KEY (id_invoice),
  CONSTRAINT invoice_custumer FOREIGN KEY (ListID) REFERENCES customer (ListID),
  CONSTRAINT invoice_terms FOREIGN KEY (id_term) REFERENCES term (id_term),
  CONSTRAINT Relationship10 FOREIGN KEY (id_salesrep) REFERENCES salesrep (id_salesrep),
  CONSTRAINT Relationship11 FOREIGN KEY (customerMsg_ListID) REFERENCES customer_msg (ListID)
);

CREATE INDEX IX_invoice_custumer ON invoice (ListID);

CREATE INDEX IX_invoice_terms ON invoice (id_term);

CREATE INDEX IX_INVOICE_SYNC ON invoice (needSync);

CREATE INDEX IX_Relationship10 ON invoice (id_salesrep);

CREATE INDEX IX_Relationship11 ON invoice (customerMsg_ListID);

-- Table invoice_item

CREATE TABLE invoice_item
(
  LineID TEXT NOT NULL,
  id_invoice TEXT NOT NULL,
  Inventory_ListID TEXT,
  Desc TEXT,
  Quantity NUMERIC,
  Rate NUMERIC,
  Amount NUMERIC,
  SalesTax_ListID TEXT,
  CONSTRAINT Key5 PRIMARY KEY (LineID),
  CONSTRAINT invoice_lines FOREIGN KEY (id_invoice) REFERENCES invoice (id_invoice),
  CONSTRAINT Relationship1 FOREIGN KEY (Inventory_ListID) REFERENCES Inventory (ListID),
  CONSTRAINT Relationship2 FOREIGN KEY (SalesTax_ListID) REFERENCES salesTax (ListID)
);

CREATE INDEX IX_invoice_lines ON invoice_item (id_invoice);

CREATE INDEX IX_Relationship1 ON invoice_item (Inventory_ListID);

CREATE INDEX IX_Relationship2 ON invoice_item (SalesTax_ListID);

-- Table pricelevel

CREATE TABLE pricelevel
(
  ListID TEXT NOT NULL,
  name TEXT,
  type TEXT,
  fixedPercentage TEXT,
  CONSTRAINT Key9 PRIMARY KEY (ListID)
);

-- Table pricelevel_item

CREATE TABLE pricelevel_item
(
  pricelevel_ListID TEXT NOT NULL,
  inventory_ListID TEXT NOT NULL,
  customPrice NUMERIC,
  CONSTRAINT Key10 PRIMARY KEY (pricelevel_ListID,inventory_ListID),
  CONSTRAINT Relationship8 FOREIGN KEY (pricelevel_ListID) REFERENCES pricelevel (ListID),
  CONSTRAINT Relationship9 FOREIGN KEY (inventory_ListID) REFERENCES Inventory (ListID)
);

-- Table customer_msg

CREATE TABLE customer_msg
(
  ListID TEXT NOT NULL,
  FullName TEXT,
  CONSTRAINT Key11 PRIMARY KEY (ListID)
);

-- Table Vendor

CREATE TABLE Vendor
(
  ListID TEXT NOT NULL,
  name TEXT,
  addr1 TEXT,
  addr2 TEXT,
  addr3 TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  CONSTRAINT Key12 PRIMARY KEY (ListID)
);

CREATE INDEX IX_VENDOR_NAME ON Vendor (name);


