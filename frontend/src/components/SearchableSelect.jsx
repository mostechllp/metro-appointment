import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = 'Select an option...', 
  error 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find the currently selected option to display its label
  const selectedOption = options.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when opening
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Filter options based on search query
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="custom-select-wrapper" ref={wrapperRef}>
      
      {/* The display box that triggers the dropdown */}
      <div 
        className={`custom-select-trigger ${isOpen ? 'open' : ''} ${error ? 'has-error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'selected-text' : 'placeholder-text'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={18} 
          className="chevron-icon" 
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} 
        />
      </div>

      {/* The Dropdown Menu */}
      {isOpen && (
        <div className="custom-select-dropdown">
          
          {/* Search Input inside dropdown */}
          <div className="custom-select-search">
            <Search size={16} className="search-icon" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking input
            />
          </div>

          {/* Options List */}
          <ul className="custom-select-list">
            {filteredOptions.length === 0 ? (
              <li className="no-results">No events found</li>
            ) : (
              filteredOptions.map((opt) => (
                <li 
                  key={opt.value} 
                  className={`custom-select-item ${opt.value === value ? 'active' : ''}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && <Check size={16} className="check-icon" />}
                </li>
              ))
            )}
          </ul>

        </div>
      )}
    </div>
  );
}