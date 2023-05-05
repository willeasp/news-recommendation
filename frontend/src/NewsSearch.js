import React, { useState, useEffect } from "react";
import axios from "axios";

const NewsSearch = () => {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [relevance, setRelevance] = useState([])
  const [open, setOpen] = useState(-1);
  
  const checkbox = (name) => {
    if (document.getElementById(name).style.backgroundColor === "rgb(48, 107, 52)") {
      document.getElementById(name).style.backgroundColor = "";
      document.getElementById(name).style.borderColor = "#222222";
    }
    else {
      document.getElementById(name).style.backgroundColor = "#306B34";
      document.getElementById(name).style.borderColor = "#306B34";
    }
  }

  const toggleRelevance = (idx) => {
    var data = [...relevance];
    data[idx] = !data[idx];
    setRelevance(data)
  }

  const getResults = async () => {
    console.log("Searching for articles");
    
    const res = await axios.get("http://localhost:5001/search", {
      params: {
        title: search,
      }
    });

    setRelevance(Array.apply(null, Array(res.data.hits.hits.length)).map(_ => false))
    console.log(res.data.hits.hits);
    setResults(res.data.hits.hits);
    
  }

  const expand = (idx) => {

    const art = document.querySelectorAll(".textDiv")
    
    var nr = 0;
    art.forEach((_) => {
      if (idx === nr) {
        const height = document.getElementById(`text-${nr}`).children[0].offsetHeight
        console.log(idx);
        document.getElementById(`text-${nr}`).style.height = `${height}px`;
      }
      else {
        document.getElementById(`text-${nr}`).style.height = '0px';
      }
      nr = nr + 1;
    })

    setOpen(idx)
  }

  const moreLikeThis = async (idx) => {

    console.log(`Want more articles which are like: ${results[idx]._source.title}`);
    const res = await axios.get("http://localhost:5001/recommend", {
      params: {
        title: results[idx]._source.title,
        text: results[idx]._source.text,
      }
    });

    setRelevance(Array.apply(null, Array(res.data.hits.hits.length)).map(_ => false))
    setResults(res.data.hits.hits);

  }

  return (
    <div className="container">
      <form>
        <label>
          Sök efter artikel
          <div className="input">
            <input type='text' value={search} onChange={ (e) => setSearch(e.target.value) } />
            <button onClick={(e) => { getResults(); e.preventDefault(); } }>Sök</button>
          </div>
        </label>
      </form>
      <div className="results" id='results' onScroll={(e) => console.log(e)} >
        {results.map((item, idx) => { return (
          <div key={idx} className="article">
            <h1>{item._source.title}</h1>
            <p>{item._source.text.replace("NYHETER", "").replace("Av:", "").trim()}</p>
            <div className="textDiv" id={`text-${idx}`}>
              <div className="text">
                {item._source.text.replace("NYHETER", "").replace("Av:", "").trim()}
              </div>
            </div>
            <div className="buttons">
              {open === idx ? <button onClick={() => expand(-1)}>Läs mindre</button> : <button onClick={() => expand(idx)}>Läs mer</button>}
              <div className="checkbox" onClick={() => {moreLikeThis(idx)}}>
                <div id={`article-${idx}`}></div>
                Mer som detta
              </div>        
            </div>
          </div>
        )})}
      </div>
    </div>
  )
}





export default NewsSearch;
