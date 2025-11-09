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
  const [transitioning, setTransitioning] = useState<number | null>(null);

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

  const cycleState = (number: number, currentSeen: boolean, currentCaught: boolean) => {
    // Mark as transitioning
    setTransitioning(number);

    if (!currentSeen && !currentCaught) {
      // Unseen → Seen
      updatePokemon(number, { seen: true, caught: false });
    } else if (currentSeen && !currentCaught) {
      // Seen → Caught
      updatePokemon(number, { seen: true, caught: true });
    } else if (currentCaught) {
      // Caught → Unseen (full reset)
      updatePokemon(number, { seen: false, caught: false });
    }

    // Clear transitioning state after animation completes
    setTimeout(() => setTransitioning(null), 500);
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

  const resetAll = async () => {
    if (!confirm('Are you sure you want to reset all Pokemon to unseen and uncaught? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/pokemon/reset', {
        method: 'POST',
      });
      const data = await response.json();
      setPokemon(data);
    } catch (error) {
      console.error('Error resetting Pokemon:', error);
    }
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
        <button className="reset-btn" onClick={resetAll}>
          Reset All
        </button>

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

            <div
              className="state-indicator"
              onClick={() => cycleState(p.number, p.seen, p.caught)}
              title={`Click to ${!p.seen ? 'mark as seen' : !p.caught ? 'catch' : 'reset to unseen'}`}
            >
              <div className="state-track">
                <div className="state-line"></div>
              </div>
              <div className={`state-ball ${p.caught ? 'caught' : p.seen ? 'seen' : 'unseen'} ${transitioning === p.number ? 'transitioning' : ''}`}>
                {!p.seen && !p.caught && <span className="question-mark">?</span>}
                {p.seen && !p.caught && (
                  <svg className="eye-icon" viewBox="0 0 24 24" width="16" height="16">
                    <ellipse cx="12" cy="12" rx="9" ry="5" fill="none" stroke="#333" strokeWidth="2"/>
                    <circle cx="12" cy="12" r="3.5" fill="#333"/>
                  </svg>
                )}
                {p.caught && <div className="pokeball-icon"></div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
