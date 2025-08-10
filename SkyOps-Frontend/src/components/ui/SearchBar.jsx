// SearchBar.jsx
import React from "react";
//import "../Header.css";

export default function SearchBar({ searchText, setSearchText, onSearch, onMeasure }) {
  return (
    <>
      <input
        type="text"
        className="search-input"
        placeholder="חפש כתובת"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />
      <button className="secondary-button" onClick={onSearch}>
        חפש
      </button>
      <button className="secondary-button" onClick={onMeasure}>
        הפעל מדידה
      </button>
    </>
  );
}
