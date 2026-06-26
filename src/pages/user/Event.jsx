import { useState } from 'react';
import { useEvents } from '../../hooks/useEvent';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

export default function Event() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('ALL LOCATIONS');
  const [selectedDistance, setSelectedDistance] = useState('ANY DISTANCE');
  
  // Connect location dropdown to backend city query
  const cityFilter = selectedLocation === 'ALL LOCATIONS' ? '' : selectedLocation;
  const { events, loading, error } = useEvents(cityFilter);

  const [expandedEvents, setExpandedEvents] = useState([]);

  const toggleExpand = (eventId) => {
    setExpandedEvents(prev =>
      prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
    );
  };

  const handleJoinToggle = (ev) => {
    if (ev.contact) {
      let cleanContact = ev.contact.replace(/\D/g, '');
      if (cleanContact.startsWith('0')) {
        cleanContact = '62' + cleanContact.slice(1);
      }
      if (cleanContact) {
        window.open(`https://wa.me/${cleanContact}`, '_blank');
      }
    }
  };

  const coverImages = [
    'https://lh3.googleusercontent.com/aida-public/AB6AXuAUn8n7BJHbo4m1NcohCTRNb0IzSw9O6klM3o8TOcBGK2G6KZSSVoEr8av3DxldJ2WGlxfOR6LW81bOB2fkSbsL-dt21JWeX5GCscPm2R11gcPafXTxlqr16NQ4pqPbAMXnxUU2nwzq9B-_SkpD5eKarM-PK4BAg3GqnX4eBWIFfLRzbmyD2N74my_-dgYkzTApt8sTYVys3DUOGnyIlCmsQ2wqyFtdvEK7fLg1j9hmCUhaUpaXltCpggP_VT0V6V7ZU_DUZ_xYhHa_',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuA1HR-nOKAsHIfK33-WjmD4U2aKqaAuScgiRHfylFndBIoFzF2fUyNQUaZYj4i1qTca4sNTky784NNdqdSVWvVrw2MntAdBV3360xQUZ4ujwLGzndGpAZGKeUkxtGidqpJxGzmPYvZVo3diXhscDYdDZGObHUV9o-EyJ4mseqGu1axrwz3omzkEV-k-CgflN-j5SzksKD1WOUFqdw7qCtA3J_7n64cFKsQ6G46blr8dKDlrWrbS5EthQRdegQSHj8cCYOU1gfNo5ZTI',
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDxw3SLTt481BINkwMeV-bDXy1_GY5gpABQoiqVEPqfczf4jqsFTCw8st1u7kRbJCFp--a0ZdwTy-891vdUdQg-OX6h5XwezM6Ty1f56CcNCHdhJ6zIDkXsR5bONdx1lytm6zgCwhxNJ3Ij_wyMRwTtGwKW9AkYgESgMTAYaJhYJ1DISGwThsb3UV6_G-YXUrVSbl_8bG-urugozyaeNVeU99Px8z2klhqQx1K-pebjmiajzoO34842g4ZBOSs8tdj120dCrJ4I3oSp'
  ];

  const getCoverImage = (id) => coverImages[id % coverImages.length];

  const getEventStats = (event) => {
    const text = `${event.title} ${event.description} ${event.route_details}`.toLowerCase();
    
    // Parse distance
    let distanceNum = 0;
    const distMatch = text.match(/(\d+)\s*km/);
    if (distMatch) {
      distanceNum = parseInt(distMatch[1], 10);
    } else {
      const defaultDistances = [80, 120, 150, 200, 50];
      distanceNum = defaultDistances[event.id % defaultDistances.length];
    }

    // Parse elevation
    let elevation = '';
    const elevMatch = text.match(/(elev\s*\+?\d+|\d+\s*m\s*elevation|\+\d+\s*m)/i);
    if (elevMatch) {
      elevation = elevMatch[0].toUpperCase();
    } else {
      const elevations = ['ELEV +800M', 'ELEV +1500M', 'ELEV +2000M', 'FLAT CIRCUIT', 'ELEV +1200M'];
      elevation = elevations[event.id % elevations.length];
    }

    return { distanceNum, distanceText: `${distanceNum}KM`, elevation };
  };

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
      return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}`;
    } catch {
      return 'OCT 14';
    }
  };

  const getEventTags = (event) => {
    const title = event.title.toUpperCase();
    if (title.includes('CAPITAL CITY CRIT')) {
      return ['JAKARTA', '120KM'];
    }
    if (title.includes('VOLCANO GRIND')) {
      return ['BANDUNG', 'ELEV +2000M'];
    }
    if (title.includes('NIGHT CRAWLER 200')) {
      return ['MIDNIGHT', 'ENDURANCE'];
    }

    const tags = [event.city.toUpperCase()];
    const stats = getEventStats(event);
    if (stats.distanceText) {
      tags.push(stats.distanceText);
    }
    if (stats.elevation) {
      tags.push(stats.elevation);
    }
    return tags;
  };

  // Client-side filtering
  const filteredEvents = (events || []).filter(event => {
    const text = `${event.title} ${event.description} ${event.city}`.toLowerCase();
    const matchesSearch = searchQuery
      ? text.includes(searchQuery.toLowerCase())
      : true;

    const stats = getEventStats(event);
    let matchesDistance = true;
    if (selectedDistance === '50KM+') {
      matchesDistance = stats.distanceNum >= 50;
    } else if (selectedDistance === '100KM+') {
      matchesDistance = stats.distanceNum >= 100;
    } else if (selectedDistance === '200KM+') {
      matchesDistance = stats.distanceNum >= 200;
    }

    return matchesSearch && matchesDistance;
  });

  return (
    <div className="flex flex-col gap-20 animate-fade-in">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-display text-2xl sm:text-display-lg-mobile md:text-display-lg font-black uppercase tracking-tighter bg-[#caf300] text-[#171e00] inline-block border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-2">
            DISCOVER EVENTS
          </h1>
          <p className="font-body text-sm sm:text-body-lg font-bold border-l-4 border-black pl-4 ml-2">
            FIND YOUR NEXT CHALLENGE. RIDE HARD.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 bg-surface border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto">
          <div className="flex-1 min-w-[200px]">
            <div className="relative flex items-center w-full h-12 border-4 border-black bg-surface-container-lowest focus-within:bg-[#caf300] focus-within:-translate-y-1 focus-within:-translate-x-1 focus-within:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75">
              <i className="fa-solid fa-magnifying-glass ml-2 text-on-surface" />
              <input
                className="w-full h-full bg-transparent border-none focus:ring-0 font-label text-label-md placeholder:text-outline p-2 font-bold outline-none"
                placeholder="Search events..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <select
            className="h-12 border-4 border-black bg-surface-container-lowest font-label text-label-md font-bold uppercase px-4 focus:ring-0 focus:bg-[#caf300] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 cursor-pointer"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="ALL LOCATIONS">ALL LOCATIONS</option>
            <option value="JAKARTA">JAKARTA</option>
            <option value="BANDUNG">BANDUNG</option>
            <option value="BALI">BALI</option>
          </select>
          <select
            className="h-12 border-4 border-black bg-surface-container-lowest font-label text-label-md font-bold uppercase px-4 focus:ring-0 focus:bg-[#caf300] focus:-translate-y-1 focus:-translate-x-1 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-75 cursor-pointer"
            value={selectedDistance}
            onChange={(e) => setSelectedDistance(e.target.value)}
          >
            <option value="ANY DISTANCE">ANY DISTANCE</option>
            <option value="50KM+">50KM+</option>
            <option value="100KM+">100KM+</option>
            <option value="200KM+">200KM+</option>
          </select>
        </div>
      </div>

      {loading && <Spinner size="lg" />}

      {error && (
        <div className="bg-error-container border-4 border-black p-4 mb-6 neo-shadow animate-shake">
          <p className="font-mono text-label-md text-on-error-container">{error}</p>
        </div>
      )}

      {/* Event Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {filteredEvents.map((ev, idx) => {
          const isExpanded = expandedEvents.includes(ev.id);

          return (
            <article
              key={ev.id}
              className="bg-surface-container-lowest border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col group hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 animate-slide-up"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              {/* Cover Image & Date */}
              <div className="relative h-48 border-b-4 border-black bg-secondary overflow-hidden">
                <img
                  className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300 will-change-transform"
                  src={getCoverImage(ev.id)}
                  alt={ev.title}
                />
                <div className="absolute top-4 right-4 bg-[#caf300] text-[#171e00] border-4 border-black px-2 py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono text-[10px] sm:text-label-md font-black uppercase">
                  {formatDate(ev.schedule)}
                </div>
              </div>

              {/* Event Body */}
              <div className="p-6 flex flex-col flex-1">
                {/* Location and Distance Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {getEventTags(ev).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className={`${
                        tIdx % 2 === 0 ? 'bg-surface' : 'bg-surface-variant'
                      } border-2 border-black px-2 py-1 font-label text-[9px] sm:text-label-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h2 className="font-display text-md sm:text-headline-md font-black uppercase mb-4 leading-tight group-hover:text-secondary transition-colors">
                  {ev.title}
                </h2>

                {/* Description */}
                <p className="font-body text-xs sm:text-body-md mb-6 flex-1 text-on-surface-variant leading-relaxed">
                  {ev.description}
                  {(ev.route_details || ev.schedule) && (
                    <button
                      onClick={() => toggleExpand(ev.id)}
                      className="ml-2 font-mono text-[10px] sm:text-label-sm text-secondary hover:underline uppercase font-bold"
                    >
                      {isExpanded ? '[ LESS ]' : '[ MORE DETAILS ]'}
                    </button>
                  )}
                </p>

                {/* Collapsible Details */}
                {isExpanded && (
                  <div className="mb-6 p-4 bg-surface-container border-2 border-black font-mono text-[10px] sm:text-label-sm text-on-surface-variant uppercase animate-slide-up">
                    <div className="flex flex-wrap items-center gap-4 mb-2 pb-1 border-b border-black">
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-calendar text-[16px]" />
                        {new Date(ev.schedule).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-outline-variant">|</span>
                      <span className="flex items-center gap-2">
                        <i className="fa-solid fa-clock text-[16px]" />
                        {new Date(ev.schedule).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    {ev.route_details && (
                      <div>
                        <div className="font-bold mb-2">Route Details</div>
                        <div className="font-body normal-case text-xs sm:text-body-md">{ev.route_details}</div>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleJoinToggle(ev)}
                  className="w-full py-3 sm:py-4 border-4 border-black font-label text-xs sm:text-label-md font-black uppercase tracking-widest shadow-neo active:translate-y-1 active:translate-x-1 active:shadow-none transition-all duration-75 flex justify-center items-center gap-2 group/btn bg-[#caf300] text-[#171e00] hover:bg-[#b0d500]"
                >
                  JOIN EVENT
                  <i className="fa-solid fa-arrow-right group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </article>
          );
        })}

        {!loading && filteredEvents.length === 0 && (
          <div className="col-span-full text-center py-20">
            <p className="text-stroke font-display text-display-lg-mobile uppercase mb-4">
              No Events
            </p>
            <p className="font-body text-body-md text-on-surface-variant">
              Coba ganti filter kota atau cari kata kunci lain 🔍
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
