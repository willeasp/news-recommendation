import React, { useState, useEffect } from "react";
import axios from "axios";

const MovieSearch = () => {
  const [name, setName] = useState("");
  const [actors, setActors] = useState("");
  const [genre, setGenre] = useState("");
  const [date, setDate] = useState("");
  const [movies, setMovies] = useState([]);

   useEffect(() => {
    const searchMovies = async () => {
      console.log("searchMovies")
      const res = await axios.get("http://localhost:5000/search", {
        proxy: {
          host: 'cors-proxy.com',
        },
        params: {
          name: name,
          actors: actors,
          genre: genre,
          date: date
        }
      });
      setMovies(res.data.hits.hits);
    };

    const recommendMovies = async () => {
      console.log("recMovies")
      const res = await axios.get("http://localhost:5000/recommend", {
        proxy: {
          host: 'cors-proxy.com',
        },
        params: {
          name: name,
          actors: actors,
          genre: genre,
          date: date
        }
      });
      setMovies(res.data.hits.hits);
    };

    if (name || actors || genre || date) {
      searchMovies();
    } else {
      setMovies([]);
    }
  }, [name, actors, genre, date]);


  //Om man klickar på en filmposter kommer liknande filmer att rekommenderas (baserat på skådespelare och genre)
  function movieClicked(movie) {
    fetch('http://localhost:5000/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      body: JSON.stringify(movie._source)
    })
    .then(response => response.json())
    .then(data => {
      setMovies(data.hits.hits);
      console.log(data);
    })
    .catch(error => console.error(error));
  }
  

  return (
    <div>
      <form>
        <label>
          Name:
          <input type="text" value={name} onChange={event => setName(event.target.value)} />
        </label>
        <br />
        <label>
          Actors:
          <input type="text" value={actors} onChange={event => setActors(event.target.value)} />
        </label>
        <br />
        <label>
          Genre:
          <input type="text" value={genre} onChange={event => setGenre(event.target.value)} />
        </label>
        <br />
        <label>
          Release Date:
          <input type="text" value={date} onChange={event => setDate(event.target.value)} />
        </label>
      </form>
      <div>
        {movies.map(movie => (
          <div key={movie._id}>
            <img src={movie._source.poster_url} alt={movie._source.name} onClick={() => movieClicked(movie)} />
            <h2>{movie._source.name}</h2>
            <p>Actors: {movie._source.actors}</p>
            <p>Genre: {movie._source.genre}</p>
            <p>Release Date: {movie._source.release_date}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MovieSearch;
