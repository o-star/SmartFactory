import React from "react";
import { Row, Col } from "reactstrap";

import Renderchart from "variables/Renderchart.js"

import { Query } from "react-apollo";
import gql from "graphql-tag";

class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.querystr = gql`query {
      devicelist {
        line, device
      }
    }`
    this.state = {
      bigChartData: "data1"
    };
  }

  setBgChartData = name => {
    this.setState({
      bigChartData: name
    });
  };
  render() { // Dashboard row 시작되는 위치
    return <Query query={gql`${this.querystr}`}>
      {({ data, loading }) => {
        if (loading) return null;

        let size = data.devicelist.length, complist = [];
        for(let i=0; i<size; i+=2){
          if(i+2<=size)
            complist.push(<Row><Col xs="6"><Renderchart line={data.devicelist[i].line} device={data.devicelist[i].device}/></Col>
            <Col xs="6"><Renderchart line={data.devicelist[i+1].line} device={data.devicelist[i+1].device}/></Col></Row>);
          else
            complist.push(<Row><Col xs="6"><Renderchart line={data.devicelist[i].line} device={data.devicelist[i].device}/></Col></Row>);
        }

        return (
          <div className="content">
            {complist}
          </div>
        );
      }}
    </Query>
  }
}

export default Dashboard;
