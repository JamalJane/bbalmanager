import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useGame } from '../context/GameContext'
import { generateDraftClass } from '../lib/draftEngine'

const GM_STYLES = [
  {
    id: 'win_now',
    label: 'Win Now',
    description: 'Go all-in on championships. Veterans over youth. Short-term dominance.',
    icon: '🏆',
    color: 'gold',
  },
  {
    id: 'rebuilder',
    label: 'The Rebuild',
    description: 'Tear it down, build it up. Acquire picks, develop talent, trust the process.',
    icon: '🔨',
    color: 'rust',
  },
  {
    id: 'player_developer',
    label: 'Player Developer',
    description: 'Focus on growth and potential. Turn raw talent into stars.',
    icon: '🌱',
    color: 'ember',
  },
  {
    id: 'loyalty_gm',
    label: 'The Loyalist',
    description: 'Keep your core together. Build around homegrown talent.',
    icon: '🤝',
    color: 'stadium',
  },
  {
    id: 'mercenary_gm',
    label: 'The Mercenary',
    description: 'No allegiances. Stack talent, make moves, win by any means.',
    icon: '⚡',
    color: 'cream',
  },
]

const GAMES_PER_SEASON = 24

const FIRST_NAMES = ['Marcus', 'Jaylen', 'Zion', 'Cameron', 'Jayson', 'Deandre', 'Tyler', 'Malik', 'Devin', 'Jamal', 'Kenny', 'Dwayne', 'Trey', 'Jordan', 'Elijah', 'Bam', 'Rashad', 'Darius', 'Chris', 'Paul', 'Kyrie', 'Luka', 'Kevin', 'Jalen', 'Dakarri', 'Deshawn', 'Marvin', 'Jerome', 'Miles', 'Ricky', 'Gabe', 'Brandon', 'Caleb', 'Aaron', 'Andre', 'Anthony', 'Austin', 'Brian', 'Carl', 'Chad', 'Charles', 'Chris', 'Cody', 'Colin', 'Corey', 'Cory', 'Craig', 'Curtis', 'Cyril', 'Dale', 'Damian', 'Daniel', 'Danny', 'David', 'Dennis', 'Derek', 'Derrick', 'Donald', 'Doug', 'Duane', 'Dustin', 'Dylan', 'Eddie', 'Edward', 'Eric', 'Erik', 'Ethan', 'Evan', 'Fernando', 'Frank', 'Fred', 'Gabriel', 'Gary', 'Gregory']
const LAST_NAMES = ['Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Moore', 'Jackson', 'Martin', 'Lee', 'Thompson', 'White', 'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Hill', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Turner', 'Phillips', 'Evans', 'Torres', 'Parker', 'Collins', 'Edwards', 'Stewart', 'Flores', 'Morris', 'Nguyen', 'Murphy', 'Rivera', 'Cook', 'Rogers', 'Morgan', 'Perez', 'Bell', 'Cooper', 'Reed', 'Bailey', 'Cox', 'Ward', 'Richardson', 'Watson', 'Brooks', 'Kelly', 'Howard', 'Green', 'Baker', 'Gonzales', 'Fisher', 'Vasquez', 'Russell', 'Sullivan', 'Castillo', 'Murray', 'Freeman', 'Wells', 'Webb', 'Simpson', 'Stevens', 'Tucker', 'Porter', 'Hunter', 'Hicks', 'Gordon', 'Blake', 'Manning', 'Holmes', 'Stone', 'Pena', 'Gordon', 'Graham', 'Soto', 'Ryan', 'Fields', 'Foster', 'Santos', 'Burgess', 'Bishop', 'Knight', 'George', 'Cunningham', 'Arnold', 'Palmer', 'Spencer', 'Chambers', 'Dean', 'Austin', 'May', 'Banks', 'Crawford', 'Coleman', 'Weaver', 'Lawrence', 'Elliott', 'Castro', 'Lamb', 'Harrison', 'Fernandez', 'George', 'McDonald', 'Woods', 'Washington', 'Kennedy', 'Allen', 'Bennett', 'Gray', 'Mendez', 'Simmons', 'Matthews', 'James', 'Stephens', 'Barnes', 'Floyd', 'Murray', 'Frank', 'Gregory', 'Byrd', 'Henry', 'Bryan', 'Hawkins', 'Bradley', 'Johnston', 'Williamson', 'Riley', 'Newton', 'Howell', 'Morrison', 'Warren', 'Dixon', 'Hansen', 'Gutierrez', 'Patterson', 'Hughes', 'Hoffman', 'Carlson', 'Silva', 'Myers', 'John', 'Raymond', 'Shaw', 'Cross', 'Duncan', 'Perry', 'Moody', 'Monroe', 'Wagner', 'Good', 'Lynch', 'Jordan', 'Patrick', 'Caldwell', 'Cline', 'Walls', 'Christensen', 'Woodward', 'Nixon', 'Weiss', 'Cooke', 'Buchanan', 'Garner', 'Mann', 'Terry', 'Benson', 'Hart', 'Bennett', 'Lloyd', 'Marsh', 'Stroud', 'Pratt', 'Christie', 'Kelley', 'Lloyd', 'Olson', 'Holt', 'Owen', 'Middleton', 'Krause', 'Holt', 'Hines', 'Michels', 'Patton', 'Wade', 'Mason', 'Rowe', 'Farrell', 'Kane', 'Duke', 'Dodson', 'Dillon', 'Cantu', 'Tate', 'Dillon', 'Durham', 'Bright', 'Stanton', 'Hull', 'Gallagher', 'Fischer', 'Mosley', 'Hebert', 'Clarke', 'Giles', 'Bouchard', 'Spence', 'Irwin', 'Moyer', 'Casey', 'Hardy', 'Skinner', 'Dodson', 'Lindsay', 'Schultz', 'Gross', 'Navarro', 'Harvey', 'Kruger', 'Valentin', 'Spalding', 'Koch', 'Irvin', 'Bowen', 'Marsh', 'Bentley', 'Steagall', 'Hickman', 'England', 'Floyd', 'Bartlett', 'Quinn', 'Burnett', 'Brennan', 'Dillon', 'Kerr', 'Houghton', 'Sheppard', 'Rowell', 'Galbraith', 'Mercer', 'Pace', 'Alvarado', 'Greer', 'Riddle', 'Battle', 'Heath', 'Holt', 'Randall', 'Clifford', 'Kramer', 'Klein', 'Hobbs', 'Thornton', 'Dennis', 'McKay', 'Talley', 'Sanford', 'Shepard', 'Oneal', 'Hardin', 'Kirk', 'Parks', 'Gould', 'Sexton', 'Hester', 'Franco', 'Lang', 'Elmore', 'Crocker', 'Sloan', 'Conrad', 'McCormick', 'Hanna', 'Boyer', 'Stark', 'Ware', 'Wilkerson', 'Vaughn', 'Ross', 'Casey', 'Bernard', 'Duke', 'Combs', 'Stokes', 'Snider', 'McCarthy', 'Esparza', 'Gould', 'Hutchins', 'Coyle', 'Avila', 'Kenney', 'Vinson', 'Beard', 'Hargis', 'Barton', 'Davenport', 'Guthrie', 'Blevins', 'Keen', 'Hargett', 'Holt', 'Carmichael', 'Keller', 'Thorn', 'Rasmussen', 'Coburn', 'Lindsay', 'Gasper', 'Hickey', 'Wentz', 'Stout', 'Akins', 'Keeton', 'Caffrey', 'Gillespie', 'Durham', 'Wylie', 'Beil', 'Gardner', 'Copeland', 'Yates', 'Rankin', 'Beaumont', 'Hatton', 'Hickman', 'Ketchum', 'Wade', 'Barrett', 'Norman', 'Person', 'Merritt', 'Hurst', 'Willis', 'Carpenter', 'Middleton', 'Scales', 'Krause', 'Hash', 'Puckett', 'Landry', 'Kim', 'Velasco', 'Ryan', 'Ladd', 'Garrison', 'Trejo', 'Tanner', 'Hinton', 'Beard', 'Champagne', 'Faulkner', 'Kline', 'Gonzales', 'Choate', 'Dotson', 'Cranford', 'Archer', 'Brennan', 'Barber', 'Counce', 'Seals', 'Minton', 'Mattingly', 'Holloway', 'Driver', 'McWhorter', 'Sheets', 'Stinnett', 'Holt', 'Kilgore', 'Morton', 'Beavers', 'Hollingsworth', 'Massey', 'Cantu', 'Goins', 'Cothern', 'Cude', 'Carmouche', 'Kirkland', 'Stogner', 'Marion', 'Dillon', 'Keen', 'Lassiter', 'Laxton', 'Goad', 'Luckett', 'Kidd', 'Conner', 'Kincaid', 'Wood', 'Almond', 'Link', 'Keeling', 'Gammill', 'Gatlin', 'Tacker', 'Pelham', 'Lively', 'Shouse', 'Polk', 'Thornburg', 'Caudill', 'Bolin', 'Hembree', 'Blythe', 'Cox', 'Bearden', 'Armstrong', 'Blair', 'Hurt', 'Gholson', 'Hollis', 'Hood', 'Gunter', 'Hensley', 'Bays', 'Buchanan', 'Ashby', 'Alford', 'Ballard', 'Barrett', 'Bearden', 'Blair', 'Bradford', 'Brock', 'Burton', 'Cain', 'Caldwell', 'Cannon', 'Carver', 'Chambers', 'Cochran', 'Combs', 'Conley', 'Cowan', 'Crowley', 'Daugherty', 'Deleon', 'Dickerson', 'Donnelly', 'Dove', 'Downs', 'Draper', 'Drake', 'Duke', 'Edwards', 'Elliott', 'Emerson', 'Estes', 'Ewing', 'Finley', 'Fischer', 'Fleming', 'Flint', 'Floyd', 'Foreman', 'Fortune', 'Frederick', 'Frost', 'Frye', 'Gaines', 'Gamble', 'Gibson', 'Gillespie', 'Goddard', 'Green', 'Griffin', 'Grisham', 'Hacker', 'Hale', 'Hamrick', 'Hankins', 'Hardy', 'Harper', 'Harrington', 'Harris', 'Hartley', 'Harvey', 'Hastings', 'Hatfield', 'Hawthorne', 'Headen', 'Henderson', 'Henry', 'Hester', 'Hill', 'Hinton', 'Hobbs', 'Hogan', 'Holder', 'Hollis', 'Holmes', 'Holt', 'Hopkins', 'Horn', 'Houston', 'Howard', 'Hubbard', 'Hudson', 'Humphrey', 'Hunt', 'Hunter', 'Hurley', 'Hutchinson', 'Hyde', 'Ingram', 'Irvin', 'Jackson', 'James', 'Jarvis', 'Jefferson', 'Jenkins', 'Jennings', 'Jensen', 'Johns', 'Johnson', 'Johnston', 'Jones', 'Justice', 'Kelley', 'Kelly', 'Kemp', 'Kennedy', 'Kent', 'Kerr', 'Kirby', 'Kirk', 'Klein', 'Kramer', 'Lambert', 'Lancaster', 'Landers', 'Lane', 'Lang', 'Lawson', 'Leach', 'Leonard', 'Lewis', 'Lindsey', 'Little', 'Lloyd', 'Logan', 'Long', 'Lopez', 'Lovell', 'Lowe', 'Lucas', 'Lynch', 'Macon', 'Maddox', 'Malone', 'Mann', 'Manning', 'Marks', 'Marsh', 'Marshall', 'Martin', 'Martinez', 'Mason', 'Massey', 'Matthews', 'May', 'Mayo', 'McAllister', 'McBride', 'McClure', 'McConnell', 'McCormick', 'McCoy', 'McCray', 'McCullough', 'McDaniel', 'McDonald', 'McFarland', 'McGee', 'McGill', 'McGowan', 'McGuire', 'McIntyre', 'McKay', 'McKee', 'McKenna', 'McKenzie', 'McKinney', 'McKnight', 'McLain', 'McLean', 'McLeod', 'McMahon', 'McMillan', 'McNair', 'McNeil', 'McPherson', 'McWilliams', 'Meadows', 'Meeks', 'Melton', 'Mendez', 'Mercer', 'Merrill', 'Merritt', 'Metcalf', 'Middleton', 'Milam', 'Miller', 'Mills', 'Minton', 'Mitchell', 'Monroe', 'Monta', 'Moody', 'Moon', 'Moore', 'Morales', 'Moran', 'Morgan', 'Morris', 'Morrison', 'Morrow', 'Morse', 'Morton', 'Moses', 'Moss', 'Mullins', 'Munn', 'Murphy', 'Murray', 'Myers', 'Nash', 'Neal', 'Nelson', 'Newell', 'Newton', 'Nichols', 'Nixon', 'Noble', 'Norman', 'Norris', 'Odell', 'Oneal', 'Oneill', 'Orourke', 'Ortega', 'Ortiz', 'Osborn', 'Owen', 'Owens', 'Padgett', 'Parker', 'Parks', 'Parrish', 'Parsons', 'Patrick', 'Patton', 'Paul', 'Payne', 'Pearson', 'Peck', 'Perez', 'Perkins', 'Perry', 'Peters', 'Peterson', 'Phelps', 'Phillips', 'Pierce', 'Pitts', 'Poole', 'Pope', 'Porter', 'Potter', 'Powell', 'Powers', 'Pratt', 'Preston', 'Price', 'Prince', 'Proctor', 'Pruitt', 'Puckett', 'Qualls', 'Quinn', 'Ramsey', 'Randall', 'Randolph', 'Rankin', 'Rapp', 'Rasmussen', 'Rawlings', 'Ray', 'Redd', 'Reed', 'Reese', 'Reid', 'Rennolds', 'Reynolds', 'Rhodes', 'Rice', 'Rich', 'Richards', 'Richardson', 'Richmond', 'Riddle', 'Ridgeway', 'Riley', 'Rios', 'Ritter', 'Rivers', 'Roach', 'Robbins', 'Roberts', 'Robertson', 'Robinson', 'Rodgers', 'Rodriguez', 'Rogers', 'Rojas', 'Rollins', 'Roman', 'Rosario', 'Ross', 'Rountree', 'Rowe', 'Rowell', 'Ruiz', 'Runyon', 'Rush', 'Russell', 'Rutan', 'Rutledge', 'Ryan', 'Salas', 'Salazar', 'Salinas', 'Salter', 'Sanchez', 'Sanders', 'Sandoval', 'Sanford', 'Satterfield', 'Sawyer', 'Scarborough', 'Schmidt', 'Schneider', 'Schultz', 'Schwartz', 'Scott', 'Sears', 'Seay', 'Seeger', 'Sells', 'Sevier', 'Shaddix', 'Shannon', 'Sharp', 'Shaw', 'Shearer', 'Shearman', 'Sheffield', 'Shelby', 'Shelton', 'Shepherd', 'Sheppard', 'Sherman', 'Sherrill', 'Shields', 'Shipley', 'Shipman', 'Shirley', 'Shockley', 'Shoemaker', 'Shores', 'Shouse', 'Shrader', 'Shuler', 'Shumate', 'Shumpert', 'Shurtz', 'Sifford', 'Simmons', 'Sims', 'Sipes', 'Sisco', 'Skeen', 'Skinner', 'Skipper', 'Slack', 'Slagle', 'Slaton', 'Slattery', 'Slaton', 'Slaven', 'Sloan', 'Slocum', 'Slough', 'Small', 'Smart', 'Smiley', 'Smith', 'Snead', 'Snodgrass', 'Snider', 'Snow', 'Snyder', 'Solomon', 'Sommers', 'Soper', 'Southerland', 'Southworth', 'Spain', 'Spann', 'Sparkman', 'Sparling', 'Spaulding', 'Speed', 'Spence', 'Spencer', 'Spicer', 'Spinks', 'Spivey', 'Spohn', 'Sprague', 'Springer', 'Spurlock', 'Squires', 'Stacy', 'Stafford', 'Staggs', 'Stahl', 'Staley', 'Stallings', 'Stamps', 'Stanford', 'Stansberry', 'Stanton', 'Staples', 'Stark', 'Starks', 'Starling', 'Starnes', 'Starr', 'Staton', 'Stebbins', 'Steed', 'Steele', 'Steelman', 'Steen', 'Stephens', 'Stephenson', 'Sterling', 'Stevens', 'Stevenson', 'Steward', 'Stewart', 'Stidham', 'Stiles', 'Still', 'Stillwell', 'Stinson', 'Stokes', 'Stollar', 'Stone', 'Stones', 'Storie', 'Storm', 'Stout', 'Stover', 'Stovall', 'Stowers', 'Strain', 'Strand', 'Strate', 'Strauss', 'Strawther', 'Strayhorn', 'Street', 'Stribling', 'Strickland', 'Stringer', 'Strode', 'Strom', 'Strong', 'Stuart', 'Stubblefield', 'Stuckey', 'Stumbo', 'Sturgill', 'Suggs', 'Sullivan', 'Summers', 'Sumner', 'Sundance', 'Surratt', 'Swain', 'Swann', 'Swanson', 'Swartz', 'Sweatt', 'Swecker', 'Swiney', 'Sykes', 'Tabor', 'Tackett', 'Talbert', 'Talley', 'Tally', 'Tanner', 'Tarpley', 'Tarrant', 'Tarver', 'Tate', 'Tatom', 'Taylor', 'Teague', 'Templeton', 'Tennessee', 'Terry', 'Thacker', 'Tharpe', 'Thomas', 'Thomason', 'Thompson', 'Thorn', 'Thornburg', 'Thornton', 'Thorp', 'Threadgill', 'Thurman', 'Thurston', 'Tibbs', 'Tidwell', 'Tierney', 'Tilley', 'Tillman', 'Timmons', 'Tingle', 'Tinsley', 'Tipton', 'Tisdale', 'Tobias', 'Todd', 'Tolbert', 'Tolar', 'Toler', 'Toliver', 'Tolliver', 'Tomlin', 'Tomlinson', 'Tompkins', 'Toney', 'Toole', 'Toomer', 'Topps', 'Torres', 'Townes', 'Townsend', 'Tracy', 'Travis', 'Treadwell', 'Treat', 'Trego', 'Tremain', 'Tremayne', 'Trent', 'Trevor', 'Trier', 'Trimble', 'Tripp', 'Trotter', 'Trout', 'Troutman', 'Troxell', 'Truett', 'Truitt', 'Trull', 'Trumbo', 'Trundy', 'Tucker', 'Tudor', 'Tully', 'Turk', 'Turner', 'Turney', 'Turpin', 'Tyler', 'Ulmer', 'Underhill', 'Underwood', 'Upchurch', 'Upton', 'Utley', 'Valdez', 'Valenzuela', 'Vallery', 'Vanhooser', 'Vaughan', 'Vaughn', 'Vaught', 'Vela', 'Venable', 'Venters', 'Verner', 'Vestal', 'Vickers', 'Vickery', 'Vigue', 'Vincent', 'Vines', 'Vinson', 'Wade', 'Wadsworth', 'Waggoner', 'Wagner', 'Wakefield', 'Walden', 'Waldrop', 'Walker', 'Wall', 'Wallace', 'Waller', 'Walling', 'Walls', 'Walters', 'Walton', 'Wampler', 'Ward', 'Wardlow', 'Ware', 'Warfield', 'Warner', 'Warren', 'Warrick', 'Washington', 'Waters', 'Watkins', 'Watson', 'Watt', 'Watts', 'Weatherford', 'Weaver', 'Webb', 'Webber', 'Weber', 'Webster', 'Weddington', 'Weeks', 'Weems', 'Weir', 'Welch', 'Wells', 'Welsh', 'Wentz', 'West', 'Westbrook', 'Westfall', 'Westmoreland', 'Weston', 'Whalen', 'Whalley', 'Whatley', 'Wheat', 'Wheatley', 'Wheeler', 'Whisnant', 'Whitaker', 'Whitcomb', 'White', 'Whitefield', 'Whitehead', 'Whitehurst', 'Whiteside', 'Whitfield', 'Whiting', 'Whitman', 'Whitney', 'Whitson', 'Whittington', 'Whorton', 'Wicker', 'Wideman', 'Widner', 'Wiggs', 'Wilborn', 'Wilburn', 'Wilcox', 'Wilkerson', 'Wilkie', 'Willett', 'Williams', 'Williamson', 'Williford', 'Willis', 'Willoughby', 'Wills', 'Wilson', 'Winchester', 'Windham', 'Windsor', 'Wine', 'Winfield', 'Wing', 'Wingo', 'Winkler', 'Winn', 'Winstead', 'Winter', 'Winters', 'Wirt', 'Wise', 'Wiseman', 'Witcher', 'Withers', 'Witherspoon', 'Witt', 'Witter', 'Wofford', 'Wolf', 'Wolfe', 'Womack', 'Wonder', 'Wood', 'Woodall', 'Woodard', 'Wooden', 'Woods', 'Woodson', 'Woodward', 'Woody', 'Woolard', 'Woolf', 'Woolfolk', 'Wooten', 'Workman', 'Worley', 'Worthington', 'Wright', 'Wyatt', 'Wylie', 'Wyman', 'Yancey', 'Yarborough', 'Yates', 'Yeary', 'York', 'Young', 'Youngblood', 'Yount', 'Zimmerman', 'Zirkle']

function generateProspectName(index) {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length]
  const lastName = LAST_NAMES[(index * 7 + 3) % LAST_NAMES.length]
  return `${firstName} ${lastName}`
}

const DIFFICULTY_RATINGS = {
  'rebuilding': { letter: 'D', label: 'Rebuilding', color: 'text-muted' },
  'contender': { letter: 'B', label: 'Contender', color: 'text-gold' },
  'dynasty': { letter: 'A', label: 'Dynasty', color: 'text-ember' }
}

const STATIC_TEAMS = [
  { id: '1d470b25-7612-478d-95e8-4d3714364395', name: 'Northern Hawks', city: 'Northgate', color_primary: '#1A3A5C', difficulty: 'rebuilding', flavor_text: 'A scrappy squad with everything to prove.' },
  { id: '4c8ac17b-386c-4282-b2fb-d997d78e9917', name: 'Southern Wolves', city: 'Southport', color_primary: '#8B1A1A', difficulty: 'rebuilding', flavor_text: 'Young talent hungry for their first title.' },
  { id: '41ec1963-3d7c-4ded-88b0-cf6bfe80f678', name: 'Eastern Eagles', city: 'Eastville', color_primary: '#1A5C2A', difficulty: 'rebuilding', flavor_text: 'Veterans on the edge of something special.' },
  { id: '73fbfb2f-3a72-4051-9a89-192eaa807edd', name: 'Western Lions', city: 'Westbrook', color_primary: '#2A1A5C', difficulty: 'contender', flavor_text: 'A dynasty in the making.' },
  { id: '3120a622-5313-42ce-b1a6-b10cca4c6e7b', name: 'Central Bears', city: 'Centerton', color_primary: '#5C1A3A', difficulty: 'contender', flavor_text: 'Rebuilding from the ground up.' },
  { id: '6f6e9c9c-3038-45aa-ad4c-c9347779f50d', name: 'River Foxes', city: 'Riverside', color_primary: '#1A4A5C', difficulty: 'contender', flavor_text: 'One piece away from contention.' },
  { id: '075c19fd-1283-4a07-97f3-d05dbc49dfbb', name: 'Mountain Kings', city: 'Highpeak', color_primary: '#3A5C1A', difficulty: 'contender', flavor_text: 'A city that bleeds for its team.' },
  { id: '8a5bd80d-1627-4fc4-9d61-981b3405be7e', name: 'Desert Storm', city: 'Dune City', color_primary: '#5C3A1A', difficulty: 'contender', flavor_text: 'Underdogs with chip on their shoulder.' },
  { id: '1fa12c9c-9aad-4b62-b20b-a1971914b0e3', name: 'Bay Sharks', city: 'Bayshore', color_primary: '#1A1A5C', difficulty: 'dynasty', flavor_text: 'The standard by which others are measured.' },
  { id: '4c62bed5-a490-4b6d-8e75-779e36098a9f', name: 'Lake Tigers', city: 'Lakewood', color_primary: '#4A1A5C', difficulty: 'dynasty', flavor_text: 'Chemistry built over years of battle.' },
  { id: 'ceb90cbb-5af8-4bd9-a254-224666b68939', name: 'Forest Owls', city: 'Maplewood', color_primary: '#5C4A1A', difficulty: 'rebuilding', flavor_text: 'A scrappy squad with everything to prove.' },
  { id: 'cdd91b77-4dde-448a-87ee-b46bf17d0eaa', name: 'Valley Raiders', city: 'Valleyview', color_primary: '#1A5C4A', difficulty: 'rebuilding', flavor_text: 'Young talent hungry for their first title.' },
  { id: 'be3d163b-fb20-4f58-a65c-12aacd85ccb4', name: 'Summit Blazers', city: 'Summit', color_primary: '#2A5C1A', difficulty: 'rebuilding', flavor_text: 'Veterans on the edge of something special.' },
  { id: 'c36d58a1-8181-47a4-a9d7-2b11d4ba3f01', name: 'Harbor Nets', city: 'Harborton', color_primary: '#5C2A1A', difficulty: 'contender', flavor_text: 'A dynasty in the making.' },
  { id: '8dd1b2b6-92ba-4f41-8587-f6253fa828e2', name: 'Canyon Bulls', city: 'Canyondale', color_primary: '#1A2A5C', difficulty: 'contender', flavor_text: 'Rebuilding from the ground up.' },
  { id: 'f6437504-92fb-43f7-80e6-14e341552010', name: 'Prairie Wind', city: 'Praireton', color_primary: '#3A1A5C', difficulty: 'contender', flavor_text: 'One piece away from contention.' },
  { id: '43938fc5-79f8-4c53-aa9b-68697c560ca6', name: 'Coastal Waves', city: 'Coastline', color_primary: '#5C1A2A', difficulty: 'contender', flavor_text: 'A city that bleeds for its team.' },
  { id: 'd60d2539-a793-4a8a-be64-8a1da7d77ac6', name: 'Highland Stags', city: 'Highland', color_primary: '#1A5C1A', difficulty: 'contender', flavor_text: 'Underdogs with chip on their shoulder.' },
  { id: 'b9a461c7-97c8-414c-ac55-13a35100c4a3', name: 'Midnight Stars', city: 'Midtown', color_primary: '#0A2A4A', difficulty: 'dynasty', flavor_text: 'The standard by which others are measured.' },
  { id: '573b43e0-92d2-4bf4-a8cd-3f23f870c3eb', name: 'Thunder Bolts', city: 'Stormfield', color_primary: '#4A2A0A', difficulty: 'dynasty', flavor_text: 'Chemistry built over years of battle.' },
  { id: 'c34b8b45-b1a7-4f7c-92bb-a6126e5512f9', name: 'Iron Giants', city: 'Ironworks', color_primary: '#2A4A0A', difficulty: 'rebuilding', flavor_text: 'A scrappy squad with everything to prove.' },
  { id: '55d42d94-82b7-40be-91b7-fa727bce4775', name: 'Silver Wolves', city: 'Silverdale', color_primary: '#0A4A2A', difficulty: 'rebuilding', flavor_text: 'Young talent hungry for their first title.' },
  { id: 'bca8f2ec-1207-41c5-8ee0-3e0ac4215d06', name: 'Golden Hawks', city: 'Goldcrest', color_primary: '#4A0A2A', difficulty: 'rebuilding', flavor_text: 'Veterans on the edge of something special.' },
  { id: '97b4d802-966d-4be5-8b7b-0e201ec3380d', name: 'Steel City Forge', city: 'Steelport', color_primary: '#2A0A4A', difficulty: 'contender', flavor_text: 'A dynasty in the making.' },
  { id: '7fe26a0f-c4e4-48ff-a444-41900e665d9f', name: 'Rapid Fire', city: 'Rapidton', color_primary: '#0A2A2A', difficulty: 'contender', flavor_text: 'Rebuilding from the ground up.' },
  { id: '919de2a2-fbe8-4777-a65c-76555e723108', name: 'Blue Ridge', city: 'Ridgemont', color_primary: '#2A2A0A', difficulty: 'contender', flavor_text: 'One piece away from contention.' },
  { id: 'a8a3de93-dd7a-458c-ac6c-0b44ef52bf84', name: 'Crimson Tide', city: 'Crimsonburg', color_primary: '#0A0A2A', difficulty: 'contender', flavor_text: 'A city that bleeds for its team.' },
  { id: '50cbb94e-8973-4e37-aced-446f2478a26c', name: 'Shadow Kings', city: 'Shadowpeak', color_primary: '#2A0A0A', difficulty: 'contender', flavor_text: 'Underdogs with chip on their shoulder.' },
  { id: 'ef7d9198-26da-4cb1-aab7-310808520568', name: 'Apex Force', city: 'Apexville', color_primary: '#0A2A0A', difficulty: 'dynasty', flavor_text: 'The standard by which others are measured.' },
  { id: '4b399941-a980-4d44-8b1a-7f83e1eb6789', name: 'Nova Squad', city: 'Novatown', color_primary: '#0A0A0A', difficulty: 'dynasty', flavor_text: 'Chemistry built over years of battle.' },
]

const STEP_TITLES = {
  1: 'Step 1: Enter Your Name',
  2: 'Step 2: League Overview',
  3: 'Step 3: Select Your Franchise',
  4: 'Step 4: Confirm Appointment'
}

export default function NewGame() {
  const navigate = useNavigate()
  const { setGmProfile, setActiveTeam, setActiveSeason, startTutorial } = useGame()

  const [step, setStep] = useState(1)
  const [gmName, setGmName] = useState('')
  const [selectedStyle, setSelectedStyle] = useState('rebuilder')
  const [teams] = useState(STATIC_TEAMS)
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [selectedTeamData, setSelectedTeamData] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState(null)

  const handleSelectTeam = (team) => {
    setSelectedTeamId(team.id)
    setSelectedTeamData(team)
  }

  const handleCreateGame = async () => {
    if (!gmName.trim() || !selectedTeamId) return
    setIsCreating(true)
    setError(null)

    try {
      const { data: dbSeason, error: seasonError } = await supabase
        .from('seasons')
        .insert({
          season_number: 1,
          games_played: 0,
          games_per_season: GAMES_PER_SEASON,
          is_active: true,
        })
        .select()
        .single();

      if (seasonError) throw new Error(seasonError.message);

      const draftClassYear = new Date().getFullYear();
      const { data: dbDraftClass, error: draftClassError } = await supabase
        .from('draft_classes')
        .insert({
          season_id: dbSeason.id,
          year: draftClassYear,
          total_prospects: 90,
        })
        .select()
        .single();

      if (!draftClassError && dbDraftClass) {
        const prospects = generateDraftClass(dbDraftClass.id, 90);
        const prospectsWithNames = prospects.map((p, i) => ({
          ...p,
          draft_pick_number: i + 1,
          name: generateProspectName(i),
        }));

        await supabase.from('prospects').insert(prospectsWithNames);
      }

      const { error: dbGmError } = await supabase
        .from('gm_profiles')
        .insert({
          manager_name: gmName.trim(),
          team_id: selectedTeamId,
          rep_archetype: selectedStyle,
          loyalty_score: 50,
          dev_score: 50,
          win_now_score: 50,
          seasons_managed: 0,
        });

      if (dbGmError) throw new Error(dbGmError.message);

      const gmData = {
        id: 'gm-' + Date.now(),
        manager_name: gmName.trim(),
        team_id: selectedTeamId,
        rep_archetype: selectedStyle,
        teams: selectedTeamData,
        loyalty_score: 50,
        dev_score: 50,
        win_now_score: 50,
        seasons_managed: 0,
      }

      const seasonData = {
        id: dbSeason.id,
        season_number: 1,
        games_played: 0,
        games_per_season: GAMES_PER_SEASON,
        is_active: true,
      }

      localStorage.setItem('hardwood_gm', JSON.stringify(gmData))
      localStorage.setItem('hardwood_season', JSON.stringify(seasonData))
      localStorage.setItem('hardwood_team', JSON.stringify(selectedTeamData))

      setGmProfile(gmData)
      setActiveTeam(selectedTeamData)
      setActiveSeason(seasonData)
      startTutorial()

      navigate('/')
    } catch (err) {
      console.error('Error creating game:', err)
      setError(err.message || 'Failed to create game. Please try again.')
      setIsCreating(false)
    }
  }

  const canContinueStep1 = gmName.trim().length >= 2
  const canContinueStep2 = true
  const canContinueStep3 = selectedTeamId !== null

  const getDifficultyRating = (difficulty) => {
    return DIFFICULTY_RATINGS[difficulty] || DIFFICULTY_RATINGS['rebuilding']
  }

  return (
    <div className="min-h-screen bg-stadium flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl text-cream tracking-wider mb-3"
          >
            BASHKETBAL
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="font-serif text-xl text-muted/60 italic"
          >
            {STEP_TITLES[step]}
          </motion.p>
        </div>

        <div className="bg-ink border border-muted/20 rounded-xl overflow-hidden">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="p-8 space-y-8"
            >
              <div>
                <label className="block text-xs text-muted/60 font-mono uppercase tracking-widest mb-3">
                  General Manager Name
                </label>
                <input
                  type="text"
                  value={gmName}
                  onChange={e => setGmName(e.target.value)}
                  onBlur={e => setGmName(e.target.value)}
                  onInput={e => setGmName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full px-5 py-4 bg-stadium border border-muted/30 rounded-lg font-display text-2xl text-cream placeholder:text-muted/30 focus:border-gold focus:outline-none transition-colors"
                  maxLength={30}
                />
                <p className="text-xs text-muted/60 mt-2 font-mono">
                  This name will appear as "GM: {gmName || '[Name]'}" throughout the game.
                </p>
              </div>

              <div>
                <label className="block text-xs text-muted/60 font-mono uppercase tracking-widest mb-4">
                  Management Style
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {GM_STYLES.map((style, i) => (
                    <motion.button
                      key={style.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setSelectedStyle(style.id)}
                      className={`p-4 rounded-lg border text-left transition-all ${
                        selectedStyle === style.id
                          ? 'border-gold bg-gold/10'
                          : 'border-muted/20 bg-stadium hover:border-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{style.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-display text-lg text-cream">{style.label}</span>
                            {selectedStyle === style.id && (
                              <span className="text-gold font-mono text-sm">Selected</span>
                            )}
                          </div>
                          <p className="text-sm text-muted/60 mt-0.5">{style.description}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => canContinueStep1 && setStep(2)}
                disabled={!canContinueStep1}
                className={`w-full py-4 rounded-lg font-mono text-lg transition-all ${
                  canContinueStep1
                    ? 'bg-gold text-stadium hover:bg-gold/90'
                    : 'bg-stadium text-muted cursor-not-allowed'
                }`}
              >
                Continue to League Overview
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="p-8 space-y-8"
            >
              <div className="text-center mb-8">
                <div className="inline-block px-6 py-3 bg-gold/10 border border-gold/30 rounded-lg mb-6">
                  <p className="font-display text-3xl text-gold mb-1">HARDWOOD LEAGUE</p>
                  <p className="font-mono text-sm text-cream/80">30-Team Professional Basketball Association</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stadium p-4 rounded-lg border border-muted/20">
                    <p className="font-display text-4xl text-gold mb-1">30</p>
                    <p className="text-xs text-muted/60 font-mono uppercase">Franchises</p>
                  </div>
                  <div className="bg-stadium p-4 rounded-lg border border-muted/20">
                    <p className="font-display text-4xl text-gold mb-1">24</p>
                    <p className="text-xs text-muted/60 font-mono uppercase">Games Per Season</p>
                  </div>
                </div>

                <div className="bg-stadium p-4 rounded-lg border border-muted/20">
                  <p className="font-mono text-xs text-gold uppercase mb-3">Season Structure</p>
                  <div className="space-y-2 text-sm text-muted/80">
                    <p><span className="text-cream">Early (Weeks 1-6):</span> Persona reveals, dev ticks begin, all-star voting opens</p>
                    <p><span className="text-cream">Mid (Weeks 7-12):</span> Trade deadline, all-star break, playoff race begins</p>
                    <p><span className="text-cream">Late (Weeks 13-24):</span> Playoff push, awards race, chemistry peaks</p>
                    <p><span className="text-cream">Playoffs:</span> 3 rounds, best of 3 series, top 6 teams</p>
                    <p><span className="text-cream">Offseason:</span> Extensions, draft, free agency, pathway resets</p>
                  </div>
                </div>

                <div className="bg-stadium p-4 rounded-lg border border-muted/20">
                  <p className="font-mono text-xs text-gold uppercase mb-3">Key Features</p>
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted/80">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-ember rounded-full"></span>
                      8 Player Personas
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-ember rounded-full"></span>
                      8 Dev Pathways
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-ember rounded-full"></span>
                      55+ Story Templates
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-ember rounded-full"></span>
                      Full League Sim
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-ember rounded-full"></span>
                      Draft System
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-ember rounded-full"></span>
                      Trade Market
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 bg-stadium text-muted rounded-lg font-mono hover:bg-muted/10 hover:text-cream transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => canContinueStep2 && setStep(3)}
                  disabled={!canContinueStep2}
                  className="flex-1 py-4 bg-gold text-stadium rounded-lg font-mono text-lg hover:bg-gold/90 transition-all"
                >
                  Choose Your Team
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="p-8 space-y-8"
            >
              <div>
                <label className="block text-xs text-muted/60 font-mono uppercase tracking-widest mb-4">
                  Select Your Franchise ({teams.length} Teams Available)
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                  {teams.map((team, i) => {
                    const diffRating = getDifficultyRating(team.difficulty)
                    return (
                      <motion.button
                        key={team.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSelectTeam(team)}
                        className={`p-4 rounded-lg border text-left transition-all ${
                          selectedTeamId === team.id
                            ? 'border-gold bg-gold/10'
                            : 'border-muted/20 bg-stadium hover:border-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: team.color_primary || '#888' }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-display text-cream text-sm truncate">
                                  {team.city} {team.name}
                                </p>
                                <p className="text-xs text-muted/60 capitalize">
                                  {team.difficulty}
                                </p>
                              </div>
                              <div className="text-right">
                                <span className={`font-display text-lg ${diffRating.color}`}>
                                  {diffRating.letter}
                                </span>
                              </div>
                            </div>
                          </div>
                          {selectedTeamId === team.id && (
                            <span className="text-gold text-lg">✓</span>
                          )}
                        </div>
                      </motion.button>
                    )
                  })}
                </div>
              </div>

              {selectedTeamData && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-4 bg-stadium rounded-lg border border-muted/20"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-mono text-gold text-xs uppercase mb-1">Selected Franchise</p>
                      <p className="font-display text-cream text-xl">
                        {selectedTeamData.city} {selectedTeamData.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`font-display text-3xl ${getDifficultyRating(selectedTeamData.difficulty).color}`}>
                        {getDifficultyRating(selectedTeamData.difficulty).letter}
                      </span>
                      <p className="text-xs text-muted/60 capitalize">
                        {getDifficultyRating(selectedTeamData.difficulty).label}
                      </p>
                    </div>
                  </div>
                  {selectedTeamData.flavor_text && (
                    <p className="font-serif italic text-muted/60 text-sm mt-2">
                      "{selectedTeamData.flavor_text}"
                    </p>
                  )}
                </motion.div>
              )}

              {error && (
                <p className="text-ember text-sm font-mono text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 bg-stadium text-muted rounded-lg font-mono hover:bg-muted/10 hover:text-cream transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => canContinueStep3 && setStep(4)}
                  disabled={!canContinueStep3}
                  className="flex-1 py-4 bg-gold text-stadium rounded-lg font-mono text-lg hover:bg-gold/90 transition-all"
                >
                  Review Appointment
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.3 }}
              className="p-8 space-y-6"
            >
              <div className="bg-cream/5 border border-cream/20 rounded-lg p-6">
                <div className="border-b border-cream/20 pb-4 mb-4">
                  <p className="font-mono text-xs text-muted/60 uppercase mb-2">Official Memorandum</p>
                  <p className="font-display text-2xl text-gold">HARDWOOD LEAGUE</p>
                  <p className="text-xs text-muted/60 font-mono">Front Office Operations</p>
                </div>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted/60 font-mono">DATE:</span>
                    <span className="text-cream font-mono">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted/60 font-mono">TO:</span>
                    <span className="text-cream font-display">{gmName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted/60 font-mono">RE:</span>
                    <span className="text-cream font-display">General Manager Appointment</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-cream/20">
                  <p className="text-cream/90 mb-4">
                    Dear Mr. {gmName},
                  </p>
                  <p className="text-cream/80 mb-4">
                    On behalf of the <span className="text-gold font-display">{selectedTeamData?.city} {selectedTeamData?.name}</span> organization, 
                    we are pleased to offer you the position of General Manager.
                  </p>
                  <p className="text-cream/80 mb-4">
                    You have been selected based on your <span className="text-cream">'{GM_STYLES.find(s => s.id === selectedStyle)?.label}'</span> management style. 
                    The league consists of 30 franchises competing over 24-game seasons with full playoff systems.
                  </p>
                  <p className="text-cream/80 mb-4">
                    Your leadership will shape the future of the franchise. Every decision—from player development 
                    to trade negotiations—will compound into your unique franchise story.
                  </p>
                  <p className="text-cream/80">
                    We look forward to your tenure as General Manager.
                  </p>
                </div>
              </div>

              <div className="bg-stadium p-4 rounded-lg border border-muted/20">
                <p className="font-mono text-xs text-muted/60 uppercase mb-3">Appointment Summary</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted/60">General Manager</p>
                    <p className="text-cream font-display">{gmName}</p>
                  </div>
                  <div>
                    <p className="text-muted/60">Franchise</p>
                    <p className="text-cream font-display">{selectedTeamData?.city} {selectedTeamData?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted/60">Difficulty</p>
                    <p className={`font-display ${getDifficultyRating(selectedTeamData?.difficulty).color}`}>
                      {getDifficultyRating(selectedTeamData?.difficulty).letter} - {getDifficultyRating(selectedTeamData?.difficulty).label}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted/60">Style</p>
                    <p className="text-cream font-display">{GM_STYLES.find(s => s.id === selectedStyle)?.label}</p>
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-ember text-sm font-mono text-center">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-4 bg-stadium text-muted rounded-lg font-mono hover:bg-muted/10 hover:text-cream transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateGame}
                  disabled={isCreating}
                  className="flex-1 py-4 bg-ember text-cream rounded-lg font-mono text-lg hover:bg-ember/90 transition-all"
                >
                  {isCreating ? 'Accepting Position...' : 'Accept the Position'}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="flex justify-center gap-3 mt-6">
          {[1, 2, 3, 4].map(s => (
            <div
              key={s}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                step === s ? 'bg-gold w-8' : 'bg-muted/30'
              }`}
            />
          ))}
        </div>
      </motion.div>

      <div className="text-center mt-6 space-y-2">
        <Link
          to="/database-setup"
          className="block text-xs text-gold underline hover:text-gold/80 font-mono"
        >
          Database Setup — Click here first if tables are empty
        </Link>
      </div>
    </div>
  )
}
