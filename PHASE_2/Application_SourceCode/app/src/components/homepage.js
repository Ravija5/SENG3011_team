import React from "react";
import NSWMap from "./nswMap";
import MenuBar from "./menuBar";
import Articles from "./article";
class Homepage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      currPage: "articles-map",
    };

    this.switchToNSWMaps = this.switchToNSWMaps.bind(this);
    this.switchToArticlesMaps = this.switchToArticlesMaps.bind(this);
  }

  switchToNSWMaps() {
    let currPage = this.state.currPage;
    if (currPage !== "nsw-map") {
      this.setState({ currPage: "nsw-map" });
    }
  }

  switchToArticlesMaps() {
    let currPage = this.state.currPage;
    if (currPage !== "articles-map") {
      this.setState({ currPage: "articles-map" });
    }
  }

  render() {
    let currPage = this.state.currPage;

    return (
      <div>
        <MenuBar
          switchToNSWMaps={this.switchToNSWMaps}
          switchToArticlesMaps={this.switchToArticlesMaps}
        />
        <div>
          {currPage === "nsw-map" ? (
            <NSWMap />
          ) : (
            <div className="articles">{<Articles />}</div>
          )}
        </div>
      </div>
    );
  }
}

export default Homepage;
