import {Component, OnInit, Output, EventEmitter} from '@angular/core';
import { MatDialog } from '@angular/material';
import {GridColumnStatusComponent} from '../grid-column-status/grid-column-status.component';
import { environment } from '../../../environments/environment.prod';
import { DataService, DataItemType, DataItemDescriptor } from '../../services/data.service';
import { DialogDataComponent } from '../dialog-data/dialog-data.component';

import {GridOptions, RowNode} from 'ag-grid';
import { identifierName } from '@angular/compiler';

@Component({
  selector: 'app-grid-publications',
  templateUrl: './grid-publications.component.html'
})
export class GridPublicationsComponent implements OnInit {

  showRemove: boolean = environment.publisher_configuration.show_remove;
  listLevel: DataItemType = DataItemType.Project;

  gridOptions: GridOptions;
  columnDefs: any[];
  rowData: any[];

  dataItemEdited: DataItemDescriptor;
  //publicationCollectionEdited: PublicationCollectionDescriptor;
  //publicationEdited: PublicationDescriptor;

  @Output() listLevelChanged: EventEmitter<DataItemType> = new EventEmitter<DataItemType>();
  @Output() publicationOpened: EventEmitter<DataItemDescriptor> = new EventEmitter<DataItemDescriptor>();

  constructor(private data: DataService, public dialog: MatDialog) {
    
    // Set up the grid
    this.gridOptions = <GridOptions>{
      enableSorting: true,
      rowSelection: 'multiple'
    };

    // Set a callback for row style (green text if published)
    this.gridOptions.getRowStyle = function(params) {
      if (params.node.data.published == 1)
        return { color: '#0d6e00' };
    };

    // Set callback so rows can be found with the getRowNode function
    this.gridOptions.getRowNodeId = function(data) {
      return data.id;
    };

    // Grid columns
    this.columnDefs = [
      {headerName: 'Title', field: 'title', width: 200, checkboxSelection: true},
      {headerName: 'Id', field: 'id', width: 70},
      {headerName: 'PublishedHidden', field: 'published', hide: true},
      {headerName: 'DatePublishedExternally', field: 'date', hide: true},
      {headerName: 'Published', field: 'publishedText', width: 90},
    ];
    // {headerName: 'Published', field: 'published', width: 200, cellRendererFramework: GridColumnStatusComponent}

    /*this.rowData = [
      {title: 'Ljungblommor', id: '1', flag: 1, published: 'Not published'},
      {title: 'Brev', id: '15', flag: 0, published: 'Published'},
      {title: 'Finland framställt i teckningar', id: '14', flag: 1, published: 'Not published'}
    ];*/
  }
  ngOnInit() {
    this.listProjects();
  }

  onGridReady(params) {
    // params.api.sizeColumnsToFit();
  }

  onSelectionChanged(event: any) {

  }

  onRowClick(event: any) {

  }

  onRowDoubleClick(event: any) {
    switch(this.listLevel) {
      case DataItemType.Project:
        // Set active project
        this.data.projectName = event.data.title;
        // List all publication collections for the project
        this.listPublicationCollections(event.data.title);
        break;
      case DataItemType.PublicationCollection:
        // Set active publication Collection
        this.data.publicationCollection = event.data.id;
        this.listPublications(this.data.projectName, event.data.id);
        break;
      case DataItemType.Publication:
        // Open publication
        this.data.publication = event.data.id;
        const publication: DataItemDescriptor = {type: DataItemType.Publication, id: event.data.id};
        this.publicationOpened.emit(publication);
    }
  }

  listProjects() {
    this.data.getProjects().subscribe(
      data => {
        this.listLevel = DataItemType.Project;
        var tmpTreeData = [];
        for(var i=0; i<data.length; i++) {
          tmpTreeData.push({'title': data[i].name, 'id': data[i].id, 'published': data[i].published, 'date': '', 'publishedText': (data[i].published ? 'Yes' : 'No')});
        }
        this.rowData = tmpTreeData;
        this.listLevelChanged.emit(this.listLevel);
      },
      err => {
        /*const tmpData = [
          {
            "id": 1,
            "project_id": 1,
            "publicationCollectionIntroduction_id": 4,
            "publicationCollectionTitle_id": 23,
            "published": true
          },
          {
            "id": 2,
            "project_id": 1,
            "publicationCollectionIntroduction_id": 6,
            "publicationCollectionTitle_id": 2,
            "published": true
          }
        ];
        var tmpTreeData = [];
        for(var i=0; i<tmpData.length; i++) {
          tmpTreeData.push({'title': tmpData[i].id.toString(), 'id': tmpData[i].id, 'published': tmpData[i].published, 'publishedText': (tmpData[i].published ? 'Yes' : 'No')});
        }
        this.rowData = tmpTreeData;*/
      }
    );
  }

  listPublicationCollections(projectName: string) {
    this.data.getPublicationCollections(projectName).subscribe(
      data => {
        this.listLevel = DataItemType.PublicationCollection;
        var tmpTreeData = [];
        for(var i=0; i<data.length; i++) {
          tmpTreeData.push({'title': data[i].name, 'id': data[i].id, 'published': data[i].published, 'date': '', 'publishedText': (data[i].published ? 'Yes' : 'No')});
        }
        this.rowData = tmpTreeData;
        this.listLevelChanged.emit(this.listLevel);
      },
      err => {
        //this.showSpinner = false;
      }
    );
  }

  listPublications(projectName: string, id: number) {
    this.data.getPublications(projectName, id).subscribe(
      data => {
        this.listLevel = DataItemType.Publication;
        var tmpTreeData = [];
        for(var i=0; i<data.length; i++) {
          tmpTreeData.push({'title': data[i].name, 'id': data[i].id, 'published': data[i].published, 'date': '', 'publishedText': (data[i].published ? 'Yes' : 'No')});
        }
        this.rowData = tmpTreeData;
        this.listLevelChanged.emit(this.listLevel);
      },
      err => {
        //this.showSpinner = false;
      }
    );
  }

  selectAllRows() {
      this.gridOptions.api.selectAll();
  }

  deselectAllRows() {
    this.gridOptions.api.deselectAll();
  }

  onParentClick() {
    switch(this.listLevel) {
      case DataItemType.PublicationCollection:
        this.listProjects();
        break;
      case DataItemType.Publication:
        this.listPublicationCollections(this.data.projectName);
        break;
    }
  }

  onAddClick() {
    // Open an edit dialog with empty data
    const dataEmpty: DataItemDescriptor = {type: this.listLevel};
    this.showDataDialog(dataEmpty);
  }

  onEditClick() {
    // Get selected rows
    const selRows = this.gridOptions.api.getSelectedRows();
    // Check that (only) one row is selected
    if(selRows.length == 1) {
      const dataItem: DataItemDescriptor = {type: this.listLevel, id: selRows[0].id, title: selRows[0].title, date: selRows[0].date, published: selRows[0].published};
      this.showDataDialog(dataItem);
    }
    else
      alert('You need to select (only) one row to edit!');
  }

  onRemoveClick() {
    // Edit
  }

  showDataDialog(dataItem: DataItemDescriptor) {
    // Show the dialog
    const dialogRef = this.dialog.open(DialogDataComponent, {
      width: '700px',
      data: dataItem
    });
    // Subscribe to dialog closed event
    dialogRef.afterClosed().subscribe(result => {
      // If title is undefined, then user cancelled the dialog
      if(result.title !== undefined) { 
        // Keep track of edited item, this will be used if server request is successful
        this.dataItemEdited = result;
        // id is defined, means that an item has been edited
        if(result.id !== undefined)
          this.editItem(result);
        // Id is not defined, add item
        else
          this.addItem(result);
      }
    });
  }

  addItem(dataItem: DataItemDescriptor) {
    switch(dataItem.type) {
      case DataItemType.Project:
        this.data.addProject(dataItem).subscribe(
          data => {
            // Set id from returned data
            this.dataItemEdited.id = data.project_id;
            // Add row
            this.addRow(data);
          },
          err => { console.info(err); }
        );
        break;

      case DataItemType.PublicationCollection:
        this.data.addPublicationCollection(this.data.projectName, dataItem).subscribe(
          data => {
            // Set id from returned data
            this.dataItemEdited.id = data.collection_id;
            // Add row
            this.addRow(data);
          },
          err => { console.info(err); }
        );
        break;

      case DataItemType.Publication:
        this.data.addPublication(this.data.projectName, this.data.publicationCollection, dataItem).subscribe(
          data => {
            // Set id from returned data
            this.dataItemEdited.id = data.publication_id;
            // Add row
            this.addRow(data);
          },
          err => { console.info(err); }
        );
        break;
    }
  }

  // Edit an item
  editItem(dataItem: DataItemDescriptor) {
    switch(dataItem.type) {
      case DataItemType.Project:
        this.data.editProject(dataItem).subscribe(
          data => {
            this.editRow(data);
          },
          err => { console.info(err); }
        );
        break;

      case DataItemType.PublicationCollection:
        this.data.editPublicationCollection(this.data.projectName, dataItem).subscribe(
        data => {
          this.editRow(data);
        },
        err => { console.info(err); }
      );
        break;
      
      case DataItemType.Publication:
        this.data.editPublication(this.data.projectName, this.data.publicationCollection, dataItem).subscribe(
          data => {
            this.editRow(data);
          },
          err => { console.info(err); }
        );
        break;
    }
  }

  addRow(data: any) {
    // Create a grid row item from the project data
    const rowDataItem = this.createGridData(this.dataItemEdited);
    // Add the new project row to the grid
    this.gridOptions.api.updateRowData({add: [rowDataItem]});
    // Print data to console
    console.info(data);
  }

  editRow(data: any) {
    // Get the row node with the id of the edited item
    let rowNode = this.gridOptions.api.getRowNode(this.dataItemEdited.id.toString());
    // Set the new item row data
    rowNode.setData(this.createGridData(this.dataItemEdited));
    // Print data to console
    console.info(data);
  }

  createGridData(dataItem: DataItemDescriptor): any {
    let newData = {'title': dataItem.title, 'id': dataItem.id, 'published': dataItem.published, 'date': dataItem.date, 'publishedText': (dataItem.published ? 'Yes' : 'No')};
    return newData;
  }

  onTestClick() {
    this.data.getSubjects().subscribe(
      data => {
        console.info(data);
      },
      err => { 
        console.info(err); 
      }
    );
  }

  test() {
    const model = this.gridOptions.api.getModel();
    const row = model.getRow(1);
    row.data.flag = 1;
    // refreshCells is not enough when cell renderer is changed
    // this.gridOptions.api.refreshCells({'rowNodes': [row]});
    this.gridOptions.api.redrawRows({'rowNodes': [row]});
    // row.updateData({title: "Brev", id: "15", flag: 1, published: "Published"});
    // alert(row.data.title);
  }
}

