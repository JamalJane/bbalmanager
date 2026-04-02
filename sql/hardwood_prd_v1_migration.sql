-- ============================================================
-- HARDWOOD MANAGER PRD v1.0 MIGRATION
-- Seeds all 8 persona categories with 79 sub-personas,
-- 8 development pathways with compatibility matrix,
-- and 55+ story templates
-- ============================================================

-- ============================================================
-- PERSONA DEFINITIONS (8 categories, 79 sub-personas)
-- ============================================================

-- Raw Diamond (10 sub-personas) - Young, unpolished, high ceiling
INSERT INTO persona_definitions (category, sub_persona, playstyle_effect, coach_response, chemistry_affinity, chemistry_clash, evolution_trigger, dev_modifier, morale_modifier) VALUES
('raw_diamond', 'projectable_prototype', 'High potential, benefits from development time', 'receptive', ARRAY['franchise_cornerstone', 'fading_legend'], ARRAY['locker_room_cancer'], 'Extended development time + mentorship', 1.15, 1.1),
('raw_diamond', 'athletic_wonder', 'Explosive athleticism, raw skills', 'receptive', ARRAY['underdog', 'quiet_assassin'], ARRAY['locker_room_cancer'], 'Showcasing athleticism in games', 1.2, 1.05),
('raw_diamond', 'height_advantage', 'Size gives immediate impact potential', 'neutral', ARRAY['enforcer', 'stretch_big'], ARRAY['quiet_assassin'], 'Dominating with size', 1.1, 1.0),
('raw_diamond', 'skill_package', 'Versatile offensive arsenal', 'receptive', ARRAY['floor_general', 'franchise_cornerstone'], ARRAY['mercenary'], 'Polishing skills in practice', 1.15, 1.1),
('raw_diamond', 'late_bloomer_trait', 'Slow start, rapid improvement potential', 'receptive', ARRAY['late_bloomer', 'underdog'], ARRAY['locker_room_cancer'], 'Breaking out after initial struggles', 1.25, 1.15),
('raw_diamond', 'competition_learner', 'Gets better facing better competition', 'receptive', ARRAY['quiet_assassin', 'underdog'], ARRAY['locker_room_cancer'], 'Strong performances against top teams', 1.1, 1.05),
('raw_diamond', 'potential_anchor', 'Future cornerstone of the franchise', 'receptive', ARRAY['franchise_cornerstone', 'facilitator'], ARRAY['mercenary', 'locker_room_cancer'], 'Sustained high-level play', 1.2, 1.15),
('raw_diamond', 'developmental_mid', 'Mid-tier ceiling, solid foundation', 'neutral', ARRAY['glue_guy', 'facilitator'], ARRAY[], 'Consistent improvement over time', 1.05, 1.0),
('raw_diamond', 'two-way_prospect', 'Offense-defense balance developing', 'receptive', ARRAY['lockdown', 'quiet_assassin'], ARRAY[], 'Balanced production', 1.1, 1.05),
('raw_diamond', 'ceiling_chaser', ' chasing max potential, risks and rewards', 'volatile', ARRAY['mercenary', 'franchise_cornerstone'], ARRAY['fading_legend', 'locker_room_cancer'], 'Reaching high potential milestones', 1.3, 0.9)
ON CONFLICT (category, sub_persona) DO NOTHING;

-- Quiet Assassin (10 sub-personas) - Low maintenance, clutch performer
INSERT INTO persona_definitions (category, sub_persona, playstyle_effect, coach_response, chemistry_affinity, chemistry_clash, evolution_trigger, dev_modifier, morale_modifier) VALUES
('quiet_assassin', 'ic_veins', 'Never rattled, delivers in clutch', 'neutral', ARRAY['floor_general', 'quiet_assassin'], ARRAY['locker_room_cancer'], 'Clutch game winners', 1.0, 1.0),
('quiet_assassin', 'offball_specialist', 'Moves without ball, finds open spots', 'receptive', ARRAY['sharpshooter', 'floor_general'], ARRAY['locker_room_cancer'], 'High efficiency nights', 1.05, 1.0),
('quiet_assassin', 'midrange_master', 'Deadly mid-range game', 'receptive', ARRAY['slasher', 'floor_general'], ARRAY[], 'Mid-range percentage above 50%', 1.0, 1.0),
('quiet_assassin', 'defensive_stick', 'Lock-down defender, night in night out', 'receptive', ARRAY['lockdown', 'quiet_assassin'], ARRAY['locker_room_cancer'], 'All-defensive team caliber games', 1.05, 1.0),
('quiet_assassin', 'spacer_big', 'Stretches floor, opens lanes', 'neutral', ARRAY['floor_general', 'sharpshooter'], ARRAY[], 'Spacing the floor effectively', 1.0, 1.0),
('quiet_assassin', 'motor_guy', 'High energy, maximum effort always', 'receptive', ARRAY['facilitator', 'underdog'], ARRAY['mercenary'], 'Hustle stats leader', 1.1, 1.05),
('quiet_assassin', 'possession_protect', 'Takes care of the ball', 'receptive', ARRAY['floor_general', 'quiet_assassin'], ARRAY['locker_room_cancer'], 'Low turnover games', 1.0, 1.0),
('quiet_assassin', 'fourth_quarter_specialist', 'Gets better as game progresses', 'neutral', ARRAY['floor_general', 'quiet_assassin'], ARRAY[], 'Strong 4th quarters', 1.05, 1.0),
('quiet_assassin', 'scoring_role_player', 'Efficient secondary scorer', 'neutral', ARRAY['sharpshooter', 'slasher'], ARRAY[], 'Consistent scoring output', 1.0, 1.0),
('quiet_assassin', 'veteran_leader', 'Experience helps team composure', 'receptive', ARRAY['franchise_cornerstone', 'fading_legend'], ARRAY['locker_room_cancer'], 'Mentoring younger players', 1.0, 1.1)
ON CONFLICT (category, sub_persona) DO NOTHING;

-- Locker Room Cancer (10 sub-personas) - Elite talent that corrodes chemistry
INSERT INTO persona_definitions (category, sub_persona, playstyle_effect, coach_response, chemistry_affinity, chemistry_clash, evolution_trigger, dev_modifier, morale_modifier) VALUES
('locker_room_cancer', 'ball_hog', 'Elite scorer but takes too many shots', 'resistant', ARRAY['mercenary'], ARRAY['floor_general', 'quiet_assassin', 'facilitator'], 'Sharing the ball more', 1.1, 0.7),
('locker_room_cancer', 'drama_king', 'Creates unnecessary team drama', 'volatile', ARRAY['mercenary'], ARRAY['quiet_assassin', 'franchise_cornerstone', 'facilitator'], 'Keeping mouth shut for extended period', 1.0, 0.6),
('locker_room_cancer', 'practice_no_show', 'Skips practices, affects team culture', 'resistant', ARRAY[], ARRAY['franchise_cornerstone', 'quiet_assassin', 'facilitator'], 'Consistent practice participation', 0.9, 0.5),
('locker_room_cancer', 'media_maker', 'Talks too much to press, causes issues', 'volatile', ARRAY['mercenary'], ARRAY['quiet_assassin', 'franchise_cornerstone'], 'Positive media presence', 1.0, 0.7),
('locker_room_cancer', 'trade_demander', 'Frequently requests trades', 'resistant', ARRAY['mercenary'], ARRAY['franchise_cornerstone', 'quiet_assassin', 'late_bloomer'], 'Long tenure without demands', 1.0, 0.6),
('locker_room_cancer', 'role_blocker', 'Blocks younger players development', 'resistant', ARRAY[], ARRAY['raw_diamond', 'underdog', 'late_bloomer'], 'Mentoring instead of blocking', 0.8, 0.5),
('locker_room_cancer', 'clutch_bomber', 'Takes bad shots in crunch time', 'volatile', ARRAY['mercenary'], ARRAY['floor_general', 'quiet_assassin'], 'Making better decisions in clutch', 1.1, 0.7),
('locker_room_cancer', 'fitness_skipper', 'Poor conditioning, affects team', 'resistant', ARRAY[], ARRAY['quiet_assassin', 'facilitator'], 'Improved conditioning', 0.85, 0.6),
('locker_room_cancer', 'attention_seeker', 'Needs spotlight constantly', 'volatile', ARRAY['mercenary'], ARRAY['quiet_assassin', 'franchise_cornerstone', 'facilitator'], 'Accepting secondary role', 0.95, 0.6),
('locker_room_cancer', 'chemistry_killer', 'Destroys team synergy', 'resistant', ARRAY['mercenary'], ARRAY['franchise_cornerstone', 'quiet_assassin', 'facilitator', 'raw_diamond', 'underdog', 'late_bloomer'], 'Rebuilding team trust', 0.7, 0.4)
ON CONFLICT (category, sub_persona) DO NOTHING;

-- Underdog (10 sub-personas) - Hidden will, outperforms rating
INSERT INTO persona_definitions (category, sub_persona, playstyle_effect, coach_response, chemistry_affinity, chemistry_clash, evolution_trigger, dev_modifier, morale_modifier) VALUES
('underdog', 'system_player', 'Excels when team system fits', 'receptive', ARRAY['floor_general', 'quiet_assassin', 'facilitator'], ARRAY['locker_room_cancer'], 'System success in big moments', 1.15, 1.1),
('underdog', 'chip_shoulder', 'Uses doubters as motivation', 'receptive', ARRAY['underdog', 'quiet_assassin'], ARRAY['mercenary'], 'Proving the doubters wrong', 1.2, 1.15),
('underdog', 'hustle_machine', 'Outworks everyone on court', 'receptive', ARRAY['facilitator', 'quiet_assassin'], ARRAY['locker_room_cancer'], 'Hustle stat dominance', 1.15, 1.1),
('underdog', 'clutch_upstart', 'Rises to occasion unexpectedly', 'receptive', ARRAY['floor_general', 'quiet_assassin'], ARRAY[], 'Multiple clutch performances', 1.2, 1.15),
('underdog', 'defensive_pest', 'Makes opponents miserable', 'receptive', ARRAY['lockdown', 'quiet_assassin'], ARRAY['locker_room_cancer'], 'Lockdown defensive games', 1.1, 1.05),
('underdog', 'comeback_kid', 'Excels after adversity', 'receptive', ARRAY['franchise_cornerstone', 'underdog'], ARRAY[], 'Bouncing back from struggles', 1.15, 1.1),
('underdog', 'scrappy_scrapper', 'Gets loose balls, second chances', 'receptive', ARRAY['enforcer', 'facilitator'], ARRAY['mercenary'], 'Winning 50-50 balls', 1.1, 1.05),
('underdog', 'sleeping_giant', 'Talent finally emerging', 'receptive', ARRAY['franchise_cornerstone', 'floor_general'], ARRAY[], 'Consistent high-level play', 1.25, 1.2),
('underdog', 'veteran_minnow', 'Old player with young legs', 'neutral', ARRAY['fading_legend', 'quiet_assassin'], ARRAY[], 'Sustained high performance', 1.05, 1.0),
('underdog', 'diamon_in_rough', 'Raw talent finally polished', 'receptive', ARRAY['floor_general', 'franchise_cornerstone'], ARRAY['locker_room_cancer'], 'Significant skill improvement', 1.2, 1.15)
ON CONFLICT (category, sub_persona) DO NOTHING;

-- Fading Legend (10 sub-personas) - Veteran in decline, still gives
INSERT INTO persona_definitions (category, sub_persona, playstyle_effect, coach_response, chemistry_affinity, chemistry_clash, evolution_trigger, dev_modifier, morale_modifier) VALUES
('fading_legend', 'mentor_prime', 'Locks up young players development', 'receptive', ARRAY['raw_diamond', 'underdog', 'franchise_cornerstone'], ARRAY['locker_room_cancer', 'mercenary'], 'Successfully mentoring a player', 0.9, 1.2),
('fading_legend', 'still_got_it', 'Occasional flashes of greatness', 'neutral', ARRAY['quiet_assassin', 'floor_general'], ARRAY[], 'Strong performance against top competition', 0.95, 1.1),
('fading_legend', 'wisdom_carrier', 'Knowledge helps team decision-making', 'receptive', ARRAY['floor_general', 'quiet_assassin', 'facilitator'], ARRAY['locker_room_cancer'], 'Team success with veteran guidance', 0.85, 1.15),
('fading_legend', 'role_accepted', 'Accepts diminished role gracefully', 'receptive', ARRAY['facilitator', 'quiet_assassin', 'underdog'], ARRAY['locker_room_cancer'], 'Seamless role transition', 0.9, 1.2),
('fading_legend', 'injury_survivor', 'Battle-tested through injuries', 'neutral', ARRAY['franchise_cornerstone', 'quiet_assassin'], ARRAY[], 'Coming back strong from injury', 0.95, 1.1),
('fading_legend', 'locker_leader', 'Keeps team together despite decline', 'receptive', ARRAY['franchise_cornerstone', 'quiet_assassin', 'facilitator'], ARRAY['locker_room_cancer', 'mercenary'], 'Holding team together through adversity', 0.85, 1.25),
('fading_legend', 'last_stand', 'Final championship push', 'neutral', ARRAY['franchise_cornerstone', 'quiet_assassin'], ARRAY[], 'Deep playoff run', 1.0, 1.15),
('fading_legend', 'graceful_exit', 'Leaving on own terms', 'receptive', ARRAY['franchise_cornerstone', 'underdog'], ARRAY[], 'Positive retirement handling', 0.9, 1.2),
('fading_legend', 'part_time_producer', 'Accepts bench role, still contributes', 'receptive', ARRAY['facilitator', 'quiet_assassin'], ARRAY[], 'Strong bench contributions', 0.9, 1.15),
('fading_legend', 'rebounding_anchor', 'Still dominates the boards', 'neutral', ARRAY['enforcer', 'quiet_assassin'], ARRAY[], 'Rebounding excellence', 0.95, 1.1)
ON CONFLICT (category, sub_persona) DO NOTHING;

-- Franchise Cornerstone (10 sub-personas) - Born to lead, demands commitment
INSERT INTO persona_definitions (category, sub_persona, playstyle_effect, coach_response, chemistry_affinity, chemistry_clash, evolution_trigger, dev_modifier, morale_modifier) VALUES
('franchise_cornerstone', 'alpha_dog', 'Unquestioned team leader', 'neutral', ARRAY['quiet_assassin', 'floor_general', 'fading_legend'], ARRAY['locker_room_cancer', 'mercenary'], 'Championship success', 1.1, 1.15),
('franchise_cornerstone', 'two_way_star', 'Elite offense and defense', 'receptive', ARRAY['quiet_assassin', 'lockdown', 'underdog'], ARRAY['locker_room_cancer'], 'All-NBA selection', 1.15, 1.2),
('franchise_cornerstone', 'offensive_engine', 'Creates for self and others', 'receptive', ARRAY['floor_general', 'quiet_assassin', 'sharpshooter'], ARRAY['locker_room_cancer'], 'High assist and scoring nights', 1.1, 1.15),
('franchise_cornerstone', 'defensive_anchor', 'Changes team defensive identity', 'receptive', ARRAY['lockdown', 'quiet_assassin', 'enforcer'], ARRAY['locker_room_cancer'], 'Defensive Player of Year', 1.1, 1.15),
('franchise_cornerstone', 'playoff_riser', 'Elevates game in playoffs', 'receptive', ARRAY['quiet_assassin', 'floor_general', 'underdog'], ARRAY['locker_room_cancer'], 'Playoff success', 1.2, 1.25),
('franchise_cornerstone', 'culture_builder', 'Sets team culture standard', 'receptive', ARRAY['fading_legend', 'facilitator', 'underdog'], ARRAY['locker_room_cancer', 'mercenary'], 'Team winning culture established', 1.05, 1.3),
('franchise_cornerstone', 'face_of_franchise', 'Represents organization', 'neutral', ARRAY['quiet_assassin', 'fading_legend'], ARRAY['mercenary'], 'Community and on-court excellence', 1.0, 1.2),
('franchise_cornerstone', 'contract_pro', 'Worth every penny', 'receptive', ARRAY['quiet_assassin', 'floor_general'], ARRAY[], 'Elite production on max contract', 1.1, 1.1),
('franchise_cornerstone', 'unselfish_star', 'Team success over personal stats', 'receptive', ARRAY['floor_general', 'facilitator', 'quiet_assassin'], ARRAY['locker_room_cancer', 'mercenary'], 'Team record breaking', 1.05, 1.25),
('franchise_cornerstone', 'clutch_champion', 'Deliver in biggest moments', 'receptive', ARRAY['quiet_assassin', 'floor_general', 'underdog'], ARRAY[], 'Game-winning shots', 1.15, 1.25)
ON CONFLICT (category, sub_persona) DO NOTHING;

-- Mercenary (9 sub-personas) - Purely transactional, no loyalty
INSERT INTO persona_definitions (category, sub_persona, playstyle_effect, coach_response, chemistry_affinity, chemistry_clash, evolution_trigger, dev_modifier, morale_modifier) VALUES
('mercenary', 'max_maker', 'Always seeking maximum contract', 'neutral', ARRAY['mercenary', 'locker_room_cancer'], ARRAY['franchise_cornerstone', 'fading_legend', 'raw_diamond'], 'Taking hometown discount', 1.05, 0.8),
('mercenary', 'ring_chaser', 'Joins contenders only', 'resistant', ARRAY['mercenary'], ARRAY['franchise_cornerstone', 'underdog', 'fading_legend'], 'Winning with underdog team', 1.1, 0.9),
('mercenary', 'stat_stuffer', 'Prioritizes personal stats', 'resistant', ARRAY['mercenary', 'locker_room_cancer'], ARRAY['facilitator', 'franchise_cornerstone', 'quiet_assassin'], 'Buying into team concept', 1.0, 0.7),
('mercenary', 'opportunist', 'Goes wherever opportunity exists', 'neutral', ARRAY['mercenary'], ARRAY['franchise_cornerstone', 'underdog', 'fading_legend'], 'Staying through adversity', 1.0, 0.85),
('mercenary', 'superstar_rental', 'Short-term elite production', 'neutral', ARRAY['mercenary'], ARRAY['franchise_cornerstone', 'underdog'], 'Re-signing long-term', 1.15, 0.9),
('mercenary', 'trade_machine', 'Frequently changing teams', 'resistant', ARRAY['mercenary'], ARRAY['franchise_cornerstone', 'underdog', 'fading_legend'], 'Long tenure in one place', 0.95, 0.75),
('mercenary', 'market_player', 'Uses FA market strategically', 'neutral', ARRAY['mercenary'], ARRAY['franchise_cornerstone', 'underdog'], 'Loyalty to one organization', 1.0, 0.8),
('mercenary', 'no_nonsense', 'Business-only mentality', 'neutral', ARRAY['mercenary', 'quiet_assassin'], ARRAY['locker_room_cancer', 'franchise_cornerstone'], 'Showing team loyalty', 1.05, 0.85),
('mercenary', 'win_at_all', 'Does whatever to win', 'volatile', ARRAY['mercenary', 'franchise_cornerstone'], ARRAY['underdog', 'fading_legend'], 'Building lasting legacy', 1.1, 0.8)
ON CONFLICT (category, sub_persona) DO NOTHING;

-- Late Bloomer (10 sub-personas) - Looks average, surprise arc incoming
INSERT INTO persona_definitions (category, sub_persona, playstyle_effect, coach_response, chemistry_affinity, chemistry_clash, evolution_trigger, dev_modifier, morale_modifier) VALUES
('late_bloomer', 'year_seven', 'Breakout typically year 7', 'receptive', ARRAY['franchise_cornerstone', 'fading_legend', 'underdog'], ARRAY['locker_room_cancer'], 'Breakout season materializes', 1.3, 1.2),
('late_bloomer', 'tool_kit', 'All skills present, none elite yet', 'receptive', ARRAY['floor_general', 'two_way'], ARRAY['locker_room_cancer'], 'One skill becomes elite', 1.25, 1.15),
('late_bloomer', 'strength_finder', 'Discovers best position late', 'receptive', ARRAY['franchise_cornerstone', 'floor_general'], ARRAY[], 'Position change success', 1.3, 1.2),
('late_bloomer', 'opportunity_grabber', 'Ready when opportunity arises', 'receptive', ARRAY['underdog', 'quiet_assassin'], ARRAY[], 'Capitalizing on increased role', 1.35, 1.25),
('late_bloomer', 'age_defier', 'Getting better with age', 'receptive', ARRAY['fading_legend', 'franchise_cornerstone'], ARRAY['locker_room_cancer'], 'Elite play past prime years', 1.2, 1.2),
('late_bloomer', 'situation_product', 'Needs right system to bloom', 'receptive', ARRAY['floor_general', 'facilitator'], ARRAY['locker_room_cancer'], 'System fit leads to breakout', 1.25, 1.15),
('late_bloomer', 'patience_pays', 'Waited years for this moment', 'receptive', ARRAY['underdog', 'fading_legend'], ARRAY['locker_room_cancer'], 'Years of patience rewarded', 1.3, 1.3),
('late_bloomer', 'trade_bounce', 'Changed scenery unlocked potential', 'receptive', ARRAY['underdog', 'quiet_assassin'], ARRAY[], 'Success after team change', 1.35, 1.15),
('late_bloomer', 'injury_return', 'Returned better from injury', 'receptive', ARRAY['fading_legend', 'quiet_assassin'], ARRAY[], 'Post-injury breakout', 1.25, 1.2),
('late_bloomer', 'confidence_boost', 'Finally believing in themselves', 'receptive', ARRAY['underdog', 'quiet_assassin', 'franchise_cornerstone'], ARRAY['locker_room_cancer'], 'Sustained confident play', 1.3, 1.25)
ON CONFLICT (category, sub_persona) DO NOTHING;

-- ============================================================
-- DEVELOPMENT PATHWAY DEFINITIONS (8 pathways)
-- ============================================================

INSERT INTO dev_pathway_definitions (id, name, description, tags, attributes, synergy_bonus, conflict_penalty) VALUES
('slasher', 'Slasher', 'Finishing, speed, athleticism', ARRAY['Relentless', 'Foul Magnet'], ARRAY['speed', 'points', 'athleticism'], 1.5, 0.55),
('sharpshooter', 'Sharpshooter', 'Shooting, off-ball movement', ARRAY['Hot Hand', 'Corner Specialist'], ARRAY['points', 'shooting_3pt', 'shooting_mid'], 1.5, 0.55),
('floor_general', 'Floor General', 'Playmaking, IQ', ARRAY['Dimer', 'Court Vision'], ARRAY['assists', 'speed', 'iq'], 1.5, 0.55),
('lockdown', 'Lockdown', 'Defense, any position', ARRAY['Pest', 'Stopper'], ARRAY['defense', 'speed', 'athleticism'], 1.5, 0.55),
('stretch_big', 'Stretch Big', 'Shooting for bigs', ARRAY['Floor Spacer', 'Face-Up Threat'], ARRAY['points', 'shooting_3pt', 'rebounds'], 1.5, 0.55),
('enforcer', 'Enforcer', 'Interior, rebounding', ARRAY['Brick Wall', 'Rim Protector'], ARRAY['rebounds', 'defense', 'strength'], 1.5, 0.55),
('facilitator', 'Facilitator', 'Passing, hustle', ARRAY['Glue Guy', 'Secondary Playmaker'], ARRAY['assists', 'hustle', 'speed'], 1.5, 0.55),
('two_way', 'Two-Way', 'Balanced growth', ARRAY['Swiss Army', 'Two-Way Player'], ARRAY['defense', 'points', 'speed'], 1.5, 0.55)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- PERSONA-PATHWAY COMPATIBILITY MATRIX
-- ============================================================

INSERT INTO persona_pathway_compatibility (persona_category, pathway_id, synergy_multiplier, conflict_multiplier, notes) VALUES
-- Raw Diamond
('raw_diamond', 'slasher', 1.4, 0.65, 'Athleticism development synergizes well'),
('raw_diamond', 'sharpshooter', 1.2, 0.7, 'Skill development takes longer'),
('raw_diamond', 'floor_general', 1.1, 0.75, 'IQ development is gradual'),
('raw_diamond', 'lockdown', 1.15, 0.7, 'Defensive instincts developing'),
('raw_diamond', 'stretch_big', 1.25, 0.65, 'Size advantage utilized'),
('raw_diamond', 'enforcer', 1.3, 0.6, 'Physical tools raw but trainable'),
('raw_diamond', 'facilitator', 1.2, 0.7, 'Team concepts learned'),
('raw_diamond', 'two_way', 1.35, 0.6, 'Balanced development works well'),

-- Quiet Assassin
('quiet_assassin', 'slasher', 1.3, 0.75, 'Efficient finishing'),
('quiet_assassin', 'sharpshooter', 1.5, 0.55, 'Perfect synergy - low maintenance scorer'),
('quiet_assassin', 'floor_general', 1.15, 0.8, 'Focus on own game'),
('quiet_assassin', 'lockdown', 1.25, 0.7, 'Multi-position defender'),
('quiet_assassin', 'stretch_big', 1.1, 0.8, 'Floor spacing ability'),
('quiet_assassin', 'enforcer', 0.9, 0.85, 'Not physical profile'),
('quiet_assassin', 'facilitator', 1.05, 0.9, 'Prefers scoring'),
('quiet_assassin', 'two_way', 1.2, 0.75, 'Balanced skill set'),

-- Locker Room Cancer
('locker_room_cancer', 'slasher', 1.2, 0.8, 'Iso-heavy style fits'),
('locker_room_cancer', 'sharpshooter', 1.1, 0.85, 'Shot-chucking works'),
('locker_room_cancer', 'floor_general', 0.7, 0.95, 'Needs to share ball'),
('locker_room_cancer', 'lockdown', 1.0, 0.9, 'Individual defense okay'),
('locker_room_cancer', 'stretch_big', 1.0, 0.9, 'Shot creation'),
('locker_room_cancer', 'enforcer', 1.2, 0.75, 'Physical play'),
('locker_room_cancer', 'facilitator', 0.5, 0.95, 'Cannot share ball'),
('locker_room_cancer', 'two_way', 0.85, 0.9, 'Team concept struggles'),

-- Underdog
('underdog', 'slasher', 1.4, 0.65, 'Relentless attacking style'),
('underdog', 'sharpshooter', 1.2, 0.75, 'Proving doubters wrong'),
('underdog', 'floor_general', 1.35, 0.65, 'Smart play style'),
('underdog', 'lockdown', 1.4, 0.6, 'Pest mentality perfect'),
('underdog', 'stretch_big', 1.2, 0.75, 'Surprise element'),
('underdog', 'enforcer', 1.3, 0.65, 'Hustle plays'),
('underdog', 'facilitator', 1.3, 0.7, 'Team-first mentality'),
('underdog', 'two_way', 1.4, 0.6, 'Versatile development'),

-- Fading Legend
('fading_legend', 'slasher', 0.75, 0.95, 'Athleticism declining'),
('fading_legend', 'sharpshooter', 1.15, 0.75, 'Efficiency over athleticism'),
('fading_legend', 'floor_general', 1.35, 0.65, 'Wisdom over athleticism'),
('fading_legend', 'lockdown', 1.05, 0.85, 'Experience matters'),
('fading_legend', 'stretch_big', 1.0, 0.9, 'Shot selection'),
('fading_legend', 'enforcer', 0.95, 0.9, 'Physical decline'),
('fading_legend', 'facilitator', 1.25, 0.7, 'Leadership style'),
('fading_legend', 'two_way', 0.95, 0.9, 'Declining athleticism'),

-- Franchise Cornerstone
('franchise_cornerstone', 'slasher', 1.3, 0.75, 'Alpha scoring style'),
('franchise_cornerstone', 'sharpshooter', 1.3, 0.7, 'Primary option shooting'),
('franchise_cornerstone', 'floor_general', 1.5, 0.55, 'Lead initiator'),
('franchise_cornerstone', 'lockdown', 1.2, 0.8, 'Two-way star'),
('franchise_cornerstone', 'stretch_big', 1.3, 0.7, 'Modern big'),
('franchise_cornerstone', 'enforcer', 1.2, 0.75, 'Physical presence'),
('franchise_cornerstone', 'facilitator', 1.35, 0.65, 'Team leader'),
('franchise_cornerstone', 'two_way', 1.4, 0.6, 'Complete player'),

-- Mercenary
('mercenary', 'slasher', 1.3, 0.75, 'Individual scoring'),
('mercenary', 'sharpshooter', 1.3, 0.75, 'Efficient scoring'),
('mercenary', 'floor_general', 1.1, 0.85, 'Needs to share ball'),
('mercenary', 'lockdown', 1.1, 0.85, 'Individual defense'),
('mercenary', 'stretch_big', 1.2, 0.8, 'Modern spacing'),
('mercenary', 'enforcer', 1.0, 0.9, 'Physical role'),
('mercenary', 'facilitator', 0.85, 0.95, 'Ball dominant'),
('mercenary', 'two_way', 1.1, 0.85, 'Versatile scorer'),

-- Late Bloomer
('late_bloomer', 'slasher', 1.2, 0.8, 'Athleticism late bloom'),
('late_bloomer', 'sharpshooter', 1.4, 0.6, 'Skill development'),
('late_bloomer', 'floor_general', 1.35, 0.65, 'IQ growth'),
('late_bloomer', 'lockdown', 1.15, 0.8, 'Defensive growth'),
('late_bloomer', 'stretch_big', 1.4, 0.6, 'Size-skill combo'),
('late_bloomer', 'enforcer', 1.15, 0.8, 'Physical growth'),
('late_bloomer', 'facilitator', 1.35, 0.65, 'Team understanding'),
('late_bloomer', 'two_way', 1.35, 0.65, 'Complete development')
ON CONFLICT (persona_category, pathway_id) DO NOTHING;

-- ============================================================
-- CHEMISTRY COMPATIBILITY MATRIX
-- ============================================================

INSERT INTO chemistry_compatibility_matrix (persona_a, persona_b, ceiling, relationship_tendency) VALUES
-- Raw Diamond pairs
('raw_diamond', 'franchise_cornerstone', 90, 'mentor'),
('raw_diamond', 'quiet_assassin', 80, 'growth'),
('raw_diamond', 'underdog', 85, 'competition'),
('raw_diamond', 'fading_legend', 85, 'mentor'),
('raw_diamond', 'facilitator', 80, 'growth'),
('raw_diamond', 'locker_room_cancer', 50, 'conflict'),
('raw_diamond', 'mercenary', 65, 'neutral'),
('raw_diamond', 'late_bloomer', 75, 'growth'),

-- Quiet Assassin pairs
('quiet_assassin', 'quiet_assassin', 75, 'balanced'),
('quiet_assassin', 'floor_general', 85, 'partnership'),
('quiet_assassin', 'franchise_cornerstone', 90, 'support'),
('quiet_assassin', 'lockdown', 85, 'defense'),
('quiet_assassin', 'sharpshooter', 80, 'spacing'),
('quiet_assassin', 'locker_room_cancer', 45, 'tension'),
('quiet_assassin', 'mercenary', 60, 'neutral'),
('quiet_assassin', 'underdog', 75, 'respect'),
('quiet_assassin', 'facilitator', 80, 'balanced'),
('quiet_assassin', 'fading_legend', 80, 'respect'),
('quiet_assassin', 'late_bloomer', 70, 'neutral'),

-- Locker Room Cancer - low ceilings with most
('locker_room_cancer', 'locker_room_cancer', 40, 'rivalry'),
('locker_room_cancer', 'mercenary', 70, 'alliance'),
('locker_room_cancer', 'franchise_cornerstone', 45, 'conflict'),
('locker_room_cancer', 'quiet_assassin', 45, 'tension'),
('locker_room_cancer', 'floor_general', 40, 'conflict'),
('locker_room_cancer', 'underdog', 50, 'tension'),
('locker_room_cancer', 'fading_legend', 50, 'tension'),
('locker_room_cancer', 'facilitator', 40, 'conflict'),
('locker_room_cancer', 'raw_diamond', 50, 'conflict'),
('locker_room_cancer', 'late_bloomer', 45, 'conflict'),

-- Underdog - high ceilings
('underdog', 'underdog', 85, 'bond'),
('underdog', 'franchise_cornerstone', 85, 'bond'),
('underdog', 'facilitator', 85, 'bond'),
('underdog', 'quiet_assassin', 75, 'respect'),
('underdog', 'fading_legend', 80, 'mentor'),
('underdog', 'floor_general', 80, 'growth'),
('underdog', 'late_bloomer', 80, 'bond'),
('underdog', 'raw_diamond', 85, 'competition'),

-- Fading Legend
('fading_legend', 'fading_legend', 75, 'bond'),
('fading_legend', 'franchise_cornerstone', 85, 'bond'),
('fading_legend', 'facilitator', 85, 'bond'),
('fading_legend', 'floor_general', 85, 'bond'),
('fading_legend', 'quiet_assassin', 80, 'respect'),
('fading_legend', 'underdog', 80, 'mentor'),
('fading_legend', 'late_bloomer', 80, 'mentor'),
('fading_legend', 'raw_diamond', 85, 'mentor'),

-- Franchise Cornerstone - highest ceilings
('franchise_cornerstone', 'franchise_cornerstone', 75, 'competition'),
('franchise_cornerstone', 'floor_general', 90, 'partnership'),
('franchise_cornerstone', 'quiet_assassin', 90, 'partnership'),
('franchise_cornerstone', 'facilitator', 90, 'bond'),
('franchise_cornerstone', 'fading_legend', 85, 'bond'),
('franchise_cornerstone', 'underdog', 85, 'bond'),
('franchise_cornerstone', 'raw_diamond', 90, 'mentor'),
('franchise_cornerstone', 'late_bloomer', 85, 'bond'),

-- Mercenary - neutral to low
('mercenary', 'mercenary', 60, 'competition'),
('mercenary', 'locker_room_cancer', 70, 'alliance'),
('mercenary', 'quiet_assassin', 60, 'neutral'),
('mercenary', 'franchise_cornerstone', 60, 'neutral'),
('mercenary', 'floor_general', 55, 'neutral'),
('mercenary', 'underdog', 65, 'neutral'),
('mercenary', 'fading_legend', 60, 'neutral'),
('mercenary', 'facilitator', 55, 'neutral'),
('mercenary', 'raw_diamond', 65, 'neutral'),
('mercenary', 'late_bloomer', 60, 'neutral'),

-- Late Bloomer
('late_bloomer', 'late_bloomer', 80, 'bond'),
('late_bloomer', 'underdog', 80, 'bond'),
('late_bloomer', 'franchise_cornerstone', 85, 'bond'),
('late_bloomer', 'fading_legend', 85, 'mentor'),
('late_bloomer', 'facilitator', 80, 'growth'),
('late_bloomer', 'floor_general', 80, 'growth'),
('late_bloomer', 'quiet_assassin', 70, 'respect'),
('late_bloomer', 'raw_diamond', 75, 'growth')
ON CONFLICT (persona_a, persona_b) DO NOTHING;

-- ============================================================
-- STORY TEMPLATES (55+ templates across 12 event types)
-- ============================================================

INSERT INTO story_templates (event_type, title, description, priority, trigger_conditions) VALUES
-- Pathway Switch (6)
('pathway_switch', 'Dev Assignment Needed', '{player} needs pathway assignment after {weeks} weeks.', 'medium', '{"weeks_min": 3}'),
('pathway_switch', 'Coach Recommendation', 'Staff recommends {pathway} for {player}.', 'medium', '{}'),
('pathway_switch', 'Bottleneck Alert', 'Development stalled for {player} - pathway required.', 'high', '{"morale_below": 40}'),
('pathway_switch', 'Potential Warning', '{player} ceiling limited without direction.', 'medium', '{}'),
('pathway_switch', 'Scout Report', '{player} needs focus. {pathway} suggested.', 'low', '{}'),
('pathway_switch', 'Decision Time', '{player} ready for pathway choice.', 'medium', '{"weeks_min": 4}'),

-- Breakout Game (8)
('breakout_game', 'Career Night', '{player} explodes for {points} points!', 'high', '{}'),
('breakout_game', 'Statement Performance', '{player} announces arrival with {points} points.', 'high', '{}'),
('breakout_game', 'Breakout Alert', '{player} drops {points} - best game of career.', 'medium', '{}'),
('breakout_game', 'Rising Star', 'The league notices {player} after {points}-point game.', 'medium', '{}'),
('breakout_game', 'Dominant Display', '{player} unstoppable with {points} and {assists} assists.', 'high', '{}'),
('breakout_game', 'Expected Emergence', 'Scouts predicted this: {player} breaks out.', 'low', '{}'),
('breakout_game', 'From Shadows', '{player} steps into spotlight with {points} points.', 'medium', '{}'),
('breakout_game', 'Milestone Night', 'Career-high {points} for {player}.', 'medium', '{}'),

-- Persona Conflict (7)
('persona_conflict', 'Tension Rising', '{player1} vs {player2} - locker room tension.', 'high', '{"morale_below": 50}'),
('persona_conflict', 'Style Clash', '{player1} ({persona1}) vs {player2} ({persona2}).', 'medium', '{}'),
('persona_conflict', 'Near Altercation', '{player1} and {player2} nearly come to blows.', 'high', '{}'),
('persona_conflict', 'Trade Demand', '{player1} blames {player2} for struggles.', 'high', '{"morale_below": 30}'),
('persona_conflict', 'Patience Gone', '{player1} frustrated with {player2} style.', 'medium', '{}'),
('persona_conflict', 'Toxic Pairing', '{player1}-{player2} chemistry at dangerous low.', 'high', '{}'),
('persona_conflict', 'Mediation Needed', 'Coaches step in between {player1} and {player2}.', 'medium', '{}'),

-- Position Shift (6)
('position_shift', 'Position Change', '{player} tested at {newPosition}.', 'medium', '{}'),
('position_shift', 'Tactical Shift', '{player} moves to {newPosition} role.', 'medium', '{}'),
('position_shift', 'Future Vision', 'Staff sees {player} as future {newPosition}.', 'low', '{}'),
('position_shift', 'Experiment Time', '{player} getting reps at {newPosition}.', 'medium', '{}'),
('position_shift', 'Position Debate', 'Should {player} play {newPosition}?', 'low', '{}'),
('position_shift', 'Versatility Test', '{player} shows promise at {newPosition}.', 'medium', '{}'),

-- Controversial Trade (7)
('controversial_trade', 'Mixed Reactions', 'Fan reaction to {player} trade split.', 'medium', '{}'),
('controversial_trade', 'Former Player Speaks', '{player} addresses trade on social media.', 'medium', '{}'),
('controversial_trade', 'Trade Debate', 'Experts still debating {player} trade.', 'low', '{}'),
('controversial_trade', 'Blockbuster Analysis', 'Breaking down the {player} deal.', 'medium', '{}'),
('controversial_trade', 'Social Media Storm', 'NBA Twitter reacts to {player} trade.', 'low', '{}'),
('controversial_trade', 'Grade Report', 'Experts give {player} trade grade: {grade}.', 'medium', '{}'),
('controversial_trade', 'Inside the Deal', 'How {player} trade came together.', 'low', '{}'),

-- Dev League Ready (8)
('dev_league_ready', 'Ready for Call-Up', '{player} readiness score: {score}. Promotion imminent?', 'high', '{"readiness_score_min": 75}'),
('dev_league_ready', 'G-League Complete', '{player} NBA-ready after development.', 'high', '{}'),
('dev_league_ready', 'Scout Recommendation', 'Promote {player} to main roster.', 'medium', '{"overall_min": 70}'),
('dev_league_ready', 'Dominant Performance', '{player} too good for development league.', 'medium', '{}'),
('dev_league_ready', 'Roster Spot Available', '{player} deserves NBA minutes.', 'medium', '{}'),
('dev_league_ready', 'Development Complete', 'Staff satisfied with {player} progress.', 'low', '{}'),
('dev_league_ready', 'Elite Potential', '{player} shows star-level ability.', 'high', '{"potential_min": 85}'),
('dev_league_ready', 'Next Step', '{player} ready for the big stage.', 'medium', '{}'),

-- Momentum Swing (8)
('momentum_swing', 'Run Started', '{team} goes on {points}-2 run.', 'medium', '{}'),
('momentum_swing', 'Momentum Shift', 'Game turning in favor of {team}.', 'medium', '{}'),
('momentum_swing', 'Spark Plug', '{player} sparks crucial run.', 'low', '{}'),
('momentum_swing', 'Rally Time', '{team} with 15-5 run that changes game.', 'medium', '{}'),
('momentum_swing', 'Crowd Energized', '{team} run has arena on feet.', 'low', '{}'),
('momentum_swing', 'Unstoppable', "{player} can't miss! {team} on {points}-0 run.", 'medium', '{}'),
('momentum_swing', 'Lead Evaporates', '{team} watches lead disappear with run.', 'medium', '{}'),
('momentum_swing', 'Spark Recaptured', '{team} reclaims momentum with surge.', 'low', '{}'),

-- Clutch Moment (8)
('clutch_moment', 'For All Marbles', '{player} calls for ball in closing seconds.', 'high', '{}'),
('clutch_moment', 'Crunch Time', '{player} has ball, season on line.', 'high', '{}'),
('clutch_moment', 'Pressure Moment', '{player} embraces the moment.', 'medium', '{}'),
('clutch_moment', 'Game Winner', '{player} rises up for potentially winning shot...', 'high', '{}'),
('clutch_moment', 'Hero Ball', 'Down to wire - {player} chance to be hero.', 'medium', '{}'),
('clutch_moment', 'Crowd Holds Breath', '{player} brings ball up slowly.', 'medium', '{}'),
('clutch_moment', 'Clutch Shot', '{player} delivers with step-back jumper!', 'high', '{}'),
('clutch_moment', 'Free Throws', '{player} ice in veins - seals it at line.', 'medium', '{}'),

-- Injury Scare (8)
('injury_scare', 'Scary Moment', '{player} grabs leg after play.', 'high', '{}'),
('injury_scare', 'Goes Down', 'Scary moment as {player} stays down.', 'high', '{}'),
('injury_scare', 'Limps Off', '{player} shaken but walks off.', 'medium', '{}'),
('injury_scare', 'Collective Gasp', '{player} needs medical attention.', 'high', '{}'),
('injury_scare', 'Tweak Report', '{player} looked to have tweaked something.', 'medium', '{}'),
('injury_scare', 'Medical Timeout', '{player} receives trainer attention.', 'medium', '{}'),
('injury_scare', 'Shakes It Off', '{player} recovers and stays in.', 'low', '{}'),
('injury_scare', 'Update Pending', 'Status of {player} still being evaluated.', 'high', '{}'),

-- Persona Revealed (7)
('persona_revealed', 'Persona Clear', '{player} revealed as {persona}.', 'medium', '{}'),
('persona_revealed', 'Identity Confirmed', 'The scouting report on {player} is complete.', 'medium', '{}'),
('persona_revealed', 'Style Crystallized', '{player} identity confirmed: {persona}.', 'low', '{}'),
('persona_revealed', 'Analysis Complete', 'Persona analysis done: {player} is {persona}.', 'medium', '{}'),
('persona_revealed', 'Long-term Scout', 'After weeks: {player} is a {persona}.', 'medium', '{}'),
('persona_revealed', 'Label Fits', 'What we suspected confirmed: {player} = {persona}.', 'low', '{}'),
('persona_revealed', 'Clarity Emerges', '{player} play style explained by {persona} tag.', 'medium', '{}'),

-- Season Start (6)
('season_start', 'Season Begins', '{team} tips off new season at {wins}-{losses}.', 'medium', '{}'),
('season_start', 'New Campaign', '{team} targets playoffs in {year}.', 'low', '{}'),
('season_start', '24-Game Gauntlet', 'The grind starts. {team} has 24 weeks.', 'medium', '{}'),
('season_start', 'Tip-Off', 'Season tip-off! {team} kicks off tonight.', 'medium', '{}'),
('season_start', 'Championship Run', '{team} locked and loaded for title push.', 'low', '{}'),
('season_start', 'Training Camp', '{team} opens camp with championship hopes.', 'low', '{}'),

-- Playoff Push (8)
('playoff_push', 'Final Stretch', '{team} needs {needed} wins in {remaining} to make playoffs.', 'high', '{}'),
('playoff_push', 'Race Heating Up', '{team} in {seed} seed with {remaining} to go.', 'medium', '{}'),
('playoff_push', 'Crunch Time', 'Postseason within reach for {team}.', 'medium', '{}'),
('playoff_push', 'Magic Number', '{needed} wins needed. {team} controls destiny.', 'high', '{}'),
('playoff_push', 'Must Win', '{team} faces must-win vs {opponent}.', 'high', '{}'),
('playoff_push', 'Probability Up', 'Playoff odds spike for {team} after win streak.', 'medium', '{}'),
('playoff_push', 'Seed Locked', '{team} clinches {seed} seed with clutch win.', 'high', '{}'),
('playoff_push', 'Home Court', '{team} secures home court advantage.', 'high', '{}'),

-- Championship Win (7)
('championship_win', 'Champions!', '{team} wins championship! {player} Finals MVP.', 'critical', '{}'),
('championship_win', 'Dynasty Complete', '{team} dynasty with dominant Finals.', 'critical', '{}'),
('championship_win', 'Trophy Time', '{team} wins it all!', 'critical', '{}'),
('championship_win', 'Legendary Performance', '{player} delivers in clinching game.', 'critical', '{}'),
('championship_win', 'History Made', '{team} celebrates championship triumph.', 'critical', '{}'),
('championship_win', 'Confetti Falls', '{team} crowned champions.', 'critical', '{}'),
('championship_win', 'City Erupts', '{team} are {year} champions!', 'critical', '{}')
ON CONFLICT DO NOTHING;

-- ============================================================
-- UPDATE SEASONS TABLE FOR 24 GAMES
-- ============================================================

UPDATE seasons SET games_per_season = 24 WHERE games_per_season = 12;
