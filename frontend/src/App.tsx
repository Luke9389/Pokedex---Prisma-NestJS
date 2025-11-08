import { useState, useEffect } from 'react';
import './App.css';

interface PokemonType {
  id: number;
  type: {
    id: number;
    name: string;
  };
}

interface Pokemon {
  id: number;
  number: number;
  name: string;
  imageUrl: string;
  caught: boolean;
  seen: boolean;
  types: PokemonType[];
}

function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'seen' | 'unseen' | 'caught'>('all');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchPokemon();
  }, []);

  const fetchPokemon = async () => {
    try {
      const response = await fetch('http://localhost:3000/pokemon');
      const data = await response.json();
      setPokemon(data);
    } catch (error) {
      console.error('Error fetching Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePokemon = async (number: number, updates: { seen?: boolean; caught?: boolean }) => {
    try {
      const response = await fetch(`http://localhost:3000/pokemon/${number}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      const updatedPokemon = await response.json();

      // Update local state
      setPokemon(prev =>
        prev.map(p => (p.number === number ? updatedPokemon : p))
      );
    } catch (error) {
      console.error('Error updating Pokemon:', error);
    }
  };

  const toggleSeen = (number: number, currentSeen: boolean) => {
    updatePokemon(number, { seen: !currentSeen });
  };

  const toggleCaught = (number: number, currentCaught: boolean, currentSeen: boolean) => {
    // When catching a Pokemon, mark it as seen too
    updatePokemon(number, {
      caught: !currentCaught,
      seen: !currentCaught ? true : currentSeen  // If catching, mark as seen
    });
  };

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)  // Remove if already selected
        : [...prev, type]                // Add if not selected
    );
  };

  const clearTypeFilter = () => {
    setSelectedTypes([]);
  };

  // Get unique types for dropdown
  const allTypes = Array.from(
    new Set(pokemon.flatMap(p => p.types.map(t => t.type.name)))
  ).sort();

  // Filter and search pokemon
  const filteredPokemon = pokemon.filter(p => {
    // Search filter
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.number.toString().includes(searchTerm);

    // Status filter
    const matchesFilter =
      filter === 'all' ? true :
      filter === 'seen' ? p.seen :
      filter === 'unseen' ? !p.seen :
      filter === 'caught' ? p.caught : true;

    // Type filter - Pokemon must have ALL selected types
    const matchesType = selectedTypes.length === 0 ? true :
                       selectedTypes.every(selectedType =>
                         p.types.some(t => t.type.name === selectedType)
                       );

    return matchesSearch && matchesFilter && matchesType;
  });

  if (loading) {
    return <div className="loading">Loading Pokedex...</div>;
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Pokedex</h1>
        <div className="stats">
          <span>Seen: {pokemon.filter(p => p.seen).length}/151</span>
          <span>Caught: {pokemon.filter(p => p.caught).length}/151</span>
        </div>

        <div className="search-controls">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name or number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="type-filter-section">
            <div className="type-filter-label">
              Filter by Type {selectedTypes.length > 0 && `(${selectedTypes.length} selected)`}
            </div>
            <div className="type-filter-buttons">
              <button
                className={`type-filter-btn clear-all-btn ${selectedTypes.length === 0 ? 'active' : ''}`}
                onClick={clearTypeFilter}
              >
                Clear All
              </button>
              {allTypes.map(type => (
                <button
                  key={type}
                  className={`type-filter-btn type-${type} ${selectedTypes.includes(type) ? 'active' : ''}`}
                  onClick={() => toggleType(type)}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({pokemon.length})
            </button>
            <button
              className={`filter-btn ${filter === 'seen' ? 'active' : ''}`}
              onClick={() => setFilter('seen')}
            >
              Seen ({pokemon.filter(p => p.seen).length})
            </button>
            <button
              className={`filter-btn ${filter === 'unseen' ? 'active' : ''}`}
              onClick={() => setFilter('unseen')}
            >
              Unseen ({pokemon.filter(p => !p.seen).length})
            </button>
            <button
              className={`filter-btn ${filter === 'caught' ? 'active' : ''}`}
              onClick={() => setFilter('caught')}
            >
              Caught ({pokemon.filter(p => p.caught).length})
            </button>
          </div>
        </div>
      </header>

      <div className="pokemon-grid">
        {filteredPokemon.map(p => (
          <div
            key={p.number}
            className={`pokemon-card ${!p.seen ? 'unseen' : ''} ${p.caught ? 'caught' : ''}`}
          >
            {p.caught && <div className="pokeball-badge"></div>}
            <div className="pokemon-number">#{p.number.toString().padStart(3, '0')}</div>

            <div className="pokemon-image-container">
              <img
                src={p.imageUrl}
                alt={p.seen ? p.name : '???'}
                className="pokemon-image"
              />
            </div>

            <div className="pokemon-info">
              <h3 className="pokemon-name">{p.seen ? p.name : '???'}</h3>
              <div className="pokemon-types">
                {p.seen && p.types.map(t => (
                  <span key={t.id} className={`type-badge type-${t.type.name}`}>
                    {t.type.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pokemon-actions">
              <button
                onClick={() => toggleSeen(p.number, p.seen)}
                className={`btn btn-seen ${p.seen ? 'active' : ''}`}
              >
                {p.seen ? 'Seen' : 'Mark Seen'}
              </button>
              <button
                onClick={() => toggleCaught(p.number, p.caught, p.seen)}
                className={`btn btn-caught ${p.caught ? 'active' : ''}`}
              >
                {p.caught ? 'Caught' : 'Catch'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
