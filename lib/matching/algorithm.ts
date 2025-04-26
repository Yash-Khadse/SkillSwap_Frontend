import { IUser } from "@/lib/db/models/user";

interface MatchResult {
  userId: string;
  matchScore: number;
  complementarySkills: {
    canTeach: string[];
    canLearn: string[];
  };
  availabilityOverlap: number; // Percentage of overlap
}

export function calculateMatches(currentUser: IUser, potentialMatches: IUser[]): MatchResult[] {
  return potentialMatches
    .filter(user => user._id.toString() !== currentUser._id.toString())
    .map(user => {
      // Find skills the current user can teach that the other user wants to learn
      const currentUserCanTeach = currentUser.teachSkills.filter(skill => 
        user.learnSkills.includes(skill)
      );
      
      // Find skills the other user can teach that the current user wants to learn
      const otherUserCanTeach = user.teachSkills.filter(skill => 
        currentUser.learnSkills.includes(skill)
      );
      
      // Calculate skill complement score (out of 100)
      const maxPossibleSkillMatches = 
        Math.min(currentUser.teachSkills.length, user.learnSkills.length) +
        Math.min(user.teachSkills.length, currentUser.learnSkills.length);
      
      const actualSkillMatches = currentUserCanTeach.length + otherUserCanTeach.length;
      
      const skillComplementScore = maxPossibleSkillMatches > 0 
        ? (actualSkillMatches / maxPossibleSkillMatches) * 100
        : 0;
      
      // Calculate availability overlap
      const availabilityOverlap = calculateAvailabilityOverlap(
        currentUser.availability,
        user.availability
      );
      
      // Final match score: 70% skill complement, 30% availability
      const matchScore = (skillComplementScore * 0.7) + (availabilityOverlap * 0.3);
      
      return {
        userId: user._id.toString(),
        matchScore,
        complementarySkills: {
          canTeach: currentUserCanTeach,
          canLearn: otherUserCanTeach,
        },
        availabilityOverlap,
      };
    })
    .filter(match => match.matchScore > 0) // Filter out zero-score matches
    .sort((a, b) => b.matchScore - a.matchScore); // Sort by score, highest first
}

function calculateAvailabilityOverlap(
  userAvailability1: IUser['availability'],
  userAvailability2: IUser['availability']
): number {
  if (!userAvailability1.length || !userAvailability2.length) {
    return 0;
  }
  
  let totalOverlapMinutes = 0;
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // For each day of the week
  daysOfWeek.forEach(day => {
    // Get all slots for this day
    const user1Slots = userAvailability1.filter(slot => slot.day === day);
    const user2Slots = userAvailability2.filter(slot => slot.day === day);
    
    // For each combination of slots
    user1Slots.forEach(slot1 => {
      user2Slots.forEach(slot2 => {
        // Convert times to minutes for easier comparison
        const slot1Start = timeToMinutes(slot1.startTime);
        const slot1End = timeToMinutes(slot1.endTime);
        const slot2Start = timeToMinutes(slot2.startTime);
        const slot2End = timeToMinutes(slot2.endTime);
        
        // Calculate overlap
        const overlapStart = Math.max(slot1Start, slot2Start);
        const overlapEnd = Math.min(slot1End, slot2End);
        
        if (overlapEnd > overlapStart) {
          totalOverlapMinutes += (overlapEnd - overlapStart);
        }
      });
    });
  });
  
  // Calculate maximum possible overlap
  const totalMinutes1 = calculateTotalAvailableMinutes(userAvailability1);
  const totalMinutes2 = calculateTotalAvailableMinutes(userAvailability2);
  const maxPossibleOverlap = Math.min(totalMinutes1, totalMinutes2);
  
  return maxPossibleOverlap > 0 ? (totalOverlapMinutes / maxPossibleOverlap) * 100 : 0;
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
}

function calculateTotalAvailableMinutes(availability: IUser['availability']): number {
  return availability.reduce((total, slot) => {
    const startMinutes = timeToMinutes(slot.startTime);
    const endMinutes = timeToMinutes(slot.endTime);
    return total + (endMinutes - startMinutes);
  }, 0);
}