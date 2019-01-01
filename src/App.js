import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
// eslint-disable-next-line
import {  Table,  TableBody,  TableHeader,  TableHeaderColumn,  TableRow,  TableRowColumn,} from 'material-ui/Table';


export const App = () => (

  <div className="App">
    <header className="App-header">
      <img src={logo} className="App-logo" alt="logo" />
      <p>
        Enter an item name and click Submit to calculate manufacturing requirements.
      </p>
      <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme)}>
        <NameForm />
      </MuiThemeProvider>
    </header>
  </div>
);

// async function get_build_price(callback)
// {
//
//     console.log("Getting build prices")
//     const response = await fetch('http://127.0.0.1:5000/build_price', { credentials: 'include'});
//     const minerals = response.json();
//
//     minerals.then(data => callback(data));
// }

async function get_material_table(callback)
{

    console.log("Getting material table")
    const response = await fetch('http://127.0.0.1:5000/material_table', { credentials: 'include'});
    const table = response.text();

    const res = table.then(data => callback(JSON.parse(data)));
    res.then(() => console.log(table));
}

export class MaterialTable extends Component {

  state  = {}

    componentDidMount() {
      const self = this;
      this.setState({table: false});

      get_material_table(table => self.setState( {material_table: table}));
    }

    createTable() {
      console.log('Creating table with ' + this.state.material_table);
      console.log('Element test: ' + this.state.material_table[0][0]);
      // console.log("Creating table with " + this.state.material_table);
      let table = []
      // console.log("Table is " + this.state.material_table)

      // Outer loop to create parent
      for (let i = 0; i < 8; i++) {
        let children = []
        //Inner loop to create children
        for (let j = 0; j < 4; j++) {
          let style = {}
          if (j !== 0){
            style = {textAlign: 'right'}
          }
          children.push(<TableRowColumn key={i*5 + j} style={style}>{`${this.state.material_table[i][j]}`}</TableRowColumn>)
        }
        //Create the parent and add the children
        table.push(<TableRow key={i*5+4}>{children}</TableRow>)
      }

      // this.setState({table: true});
      return table
    }

    render(){
      return (
        <>
      {
        this.state && this.state.material_table &&
        <Table  selectable={false} style={{width:500}}>
        <TableHeader displaySelectAll={false}>
          <TableRow>
        		<TableHeaderColumn style={{textAlign: 'left'}}>Mineral</TableHeaderColumn>
        		<TableHeaderColumn style={{textAlign: 'center'}}>Used</TableHeaderColumn>
        		<TableHeaderColumn style={{textAlign: 'center'}}>Required</TableHeaderColumn>
        		<TableHeaderColumn style={{textAlign: 'center'}}>Excess</TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false} stripedRows={true}>
        {this.createTable()}
        </TableBody>
        </Table>
      }
      </>
    )}
}



async function get_minerals(callback)
{

    console.log("Querying mineral multibuy")
    const response = await fetch('http://127.0.0.1:5000/multibuy_minerals', { credentials: 'include'});
    const minerals = response.json();

    minerals.then(data => callback(data));
}

async function get_ore(callback)
{

  console.log("Querying ore multibuy")
  const response = await fetch('http://127.0.0.1:5000/multibuy_ore', { credentials: 'include'});
  const ore = response.json();
  ore.then(data => callback(data));
}

export class Multibuy extends Component {

  state = {processing:false}

  clearSession() {

    this.setState({processing:true})

    console.log("Clearing session")
    fetch('http://127.0.0.1:5000/clear', { credentials: 'include'});
    this.setState({minerals: false, ore: false});
  }

  componentDidMount() {
    const self = this;

    get_minerals(data => self.setState({ minerals: data }));
    get_ore(data => self.setState({ ore: data }));
    // get_material_table(table => self.setState( {material_table: table}));
    // get_material_table(table => self.setState( {material_table: renderHTML(table)}));
    // get_build_price(prices => self.setState({ mineral_price: prices.minerals, ore_price: prices.ore }));
  }

  render(){


    // console.log("Table: " + this.state.material_table);

    return(
      <div>
      {
        this.state && this.state.minerals && this.state.ore &&
        <>
      <div className="parent">
        <div className="child inline-block-child">
        <Card  initiallyExpanded={true}>
          <CardHeader actAsExpander={true} showExpandableButton={true}
          title="Multibuy (Minerals)" subtitle={this.state.mineral_price}/>
            <CardText  expandable={true}> <code> {this.state.minerals} </code> </CardText>
          </Card>
        </div>&nbsp;
        <div className="child inline-block-child">
        <Card  initiallyExpanded={true}>
        <CardHeader actAsExpander={true} showExpandableButton={true}
        title="Multibuy (Ore)" subtitle={this.state.ore_price}/>
          <CardText expandable={true}> <code> {this.state.ore} </code> </CardText>
          </Card>
        </div>
      </div>

      <div className="parent">
        <MaterialTable/>
      </div>
      </>
  }
  </div>
);}}

// <>{this.state.material_table}</>
export class NameForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
        response: '',
        post: '',
        item_name: '',
        item_quantity: '1',
        responseToPost: '',
        processing: 0,
        minerals: '',
      };



    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);



    console.log("Sending clear");
    fetch('http://127.0.0.1:5000/clear', { credentials: 'include'});
  }

  handleChange(event) {
    this.setState({test: event.target.value});
  }


  clearSession() {

    this.setState({processing:0})

    fetch('http://127.0.0.1:5000/clear', { credentials: 'include'});

  }


  getMinerals = async() => {
    var minerals = "1x tritanium";
    return minerals;
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({processing: 1})

    var data = {};
    data.item = this.state.item_name;
    data.quantity = this.state.item_quantity;
    console.log("Sending submit");
    const response = fetch('http://127.0.0.1:5000/post_test', {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(
        { data }),
    });
    response.then(() => this.setState({ processing: 2}));
  };

  render() {
    let multibuy;

    switch (this.state.processing){

      case 0:
        multibuy = "";
        break;

      case 1:
        multibuy = "Calculating build costs for " +
          this.state.item_quantity + "x " +
          this.state.item_name + "(s)";
          break;

      case 2:
        multibuy =  <Multibuy/>;
        break;

      default:
        multibuy = "Error!";
        break;

    }

    return (
      <>
      <form onSubmit={this.handleSubmit}>
        <label>
          Item name:
        </label>
        <TextField id="itemField" hintText="Rifter" type="text"
          value={this.state.item_name}
          onChange={e => this.setState({item_name: e.target.value})}
          style = {{width: 150, "marginLeft":5, "marginRight":20}}/>

        <label>
          Quantity:
        </label>
        <TextField type="text" id="quantityField"
          value={this.state.item_quantity}
          onChange={e => this.setState({item_quantity: e.target.value})}
          style = {{width: 20, "marginLeft":5, "marginRight":25}}/>

          <RaisedButton type="submit" label="Submit" style={{marginRight: 15}} />

          <RaisedButton label="Clear" onClick={this.clearSession.bind(this)} />
      </form>
      {multibuy}
      <p>{this.state.responseToPost}</p>


      </>
    );
  }
}


// export default App;
