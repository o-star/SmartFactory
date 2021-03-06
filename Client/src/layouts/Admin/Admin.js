import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";
import PerfectScrollbar from "perfect-scrollbar";

import { Query } from "react-apollo";
import gql from "graphql-tag";

import ProcessLine from "variables/ProcessLine.js";

// core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import Footer from "components/Footer/Footer.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import FixedPlugin from "components/FixedPlugin/FixedPlugin.js";
import Login from "loginviews/Login.js";

import routes from "routes.js";

import logo from "assets/img/react-logo.png";

var ps;

class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.querystr = gql`query {
      devicelist {
        line, device
      }
    }`
    this.state = {
      reloadable: 0,
      loginstate: true,  // login 페이지 출력 여부
      backgroundColor: "blue",
      sidebarOpened:
        document.documentElement.className.indexOf("nav-open") !== -1
    };
  }
  componentDidMount() {
    if (navigator.platform.indexOf("Win") > -1) {
      document.documentElement.className += " perfect-scrollbar-on";
      document.documentElement.classList.remove("perfect-scrollbar-off");
      ps = new PerfectScrollbar(this.refs.mainPanel, { suppressScrollX: true });
      let tables = document.querySelectorAll(".table-responsive");
      for (let i = 0; i < tables.length; i++) {
        ps = new PerfectScrollbar(tables[i]);
      }
    }
  }
  componentWillUnmount() {
    if (navigator.platform.indexOf("Win") > -1) {
      ps.destroy();
      document.documentElement.className += " perfect-scrollbar-off";
      document.documentElement.classList.remove("perfect-scrollbar-on");
    }
  }
  componentDidUpdate(e) {
    if (e.history.action === "PUSH") {
      if (navigator.platform.indexOf("Win") > -1) {
        let tables = document.querySelectorAll(".table-responsive");
        for (let i = 0; i < tables.length; i++) {
          ps = new PerfectScrollbar(tables[i]);
        }
      }
      document.documentElement.scrollTop = 0;
      document.scrollingElement.scrollTop = 0;
      this.refs.mainPanel.scrollTop = 0;
    }
  }
  // this function opens and closes the sidebar on small devices
  toggleSidebar = () => {
    document.documentElement.classList.toggle("nav-open");
    this.setState({ sidebarOpened: !this.state.sidebarOpened });
  };
  ////////////////////// layout == "/admin"
  getRoutes = routes => {
    return <Query query={gql`${this.querystr}`}>
      {({ data, loading }) => {
        if (loading) return null;

        let size = data.devicelist.length, visit = new Array(100), makable;
        for (let i = 0; i < size; i++) {
          if (visit[data.devicelist[i].line] == null) {
            makable = true;
            for (let j = 0; j < routes.length; j++)
              if (routes[j].name == `Processline${data.devicelist[i].line}`) makable = false;

            if (makable) {
              routes.push(
                {
                  path: `/Processline/${data.devicelist[i].line}`,
                  name: `Processline${data.devicelist[i].line}`,
                  icon: "tim-icons icon-align-center",
                  component: ProcessLine,
                  layout: "/admin"
                }
              );
              visit[data.devicelist[i].line] = true;
              let comp = this.state.reloadable;
              this.setState({ reloadable: (comp + 1) % 5 })
            }
          }
        }

        return routes.map((prop, key) => {
          if (prop.layout === "/admin") {
            return (
              <Route
                path={prop.layout + prop.path}
                component={prop.component}
                key={key}
              />
            );
          } else {
            return null;
          }
        });
      }}
    </Query>
  };
  handleBgClick = color => {
    this.setState({ backgroundColor: color });
  };
  getBrandText = path => {
    for (let i = 0; i < routes.length; i++) {
      if (
        this.props.location.pathname.indexOf(
          routes[i].layout + routes[i].path
        ) !== -1
      ) {
        return routes[i].name;
      }
    }
    return "Brand";
  };
  render() {
    if (this.state.loginstate) {
      return (
        <>
          <div className="wrapper">
            <Sidebar
              {...this.getRoutes(routes)}
              {...this.props}
              routes={routes}
              bgColor={this.state.backgroundColor}
              logo={{
                text: "Smart Factory",
                imgSrc: logo
              }}
              toggleSidebar={this.toggleSidebar}
            />
            <div
              className="main-panel"
              ref="mainPanel"
              data={this.state.backgroundColor}
            >
              <AdminNavbar
                {...this.props}
                brandText={this.getBrandText(this.props.location.pathname)}
                toggleSidebar={this.toggleSidebar}
                sidebarOpened={this.state.sidebarOpened}
              />
              <Switch>
                {this.getRoutes(routes)}
                <Redirect from="*" to="/admin/dashboard" />
              </Switch>
              {// we don't want the Footer to be rendered on map page
                this.props.location.pathname.indexOf("maps") !== -1 ? null : (
                  <Footer fluid />
                )}
            </div>
          </div>
          <FixedPlugin
            bgColor={this.state.backgroundColor}
            handleBgClick={this.handleBgClick}
          />
        </>
      );
    }
    else {
      return (
        <Login />
      )
    }
  }
}

export default Admin;
