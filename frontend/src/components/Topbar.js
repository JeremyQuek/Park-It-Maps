import React from "react";
import { Link } from "react-router-dom";
import { TbSettings } from "react-icons/tb";
import { MdOutlineBookmarkBorder } from "react-icons/md";

const TopBar = () => (
  <div className="top-bar">
    <Link
      to="/bookmarks"
      className="icon-link"
      style={{
        position: "absolute",
        left: 10,
      }}
    >
      <MdOutlineBookmarkBorder size={28} />
    </Link>
    <h1>Where to?</h1>
    <Link
      to="/settings"
      className="icon-link"
      style={{
        position: "absolute",
        right: 10,
      }}
    >
      <TbSettings size={28} />
    </Link>
  </div>
);

export default TopBar;
