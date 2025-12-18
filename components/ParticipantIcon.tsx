import { Participant } from '@/types/game';

interface Props {
  participant: Participant;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function ParticipantIcon({ participant, size = 'md' }: Props) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xl',
    md: 'w-10 h-10 text-2xl',
    lg: 'w-12 h-12 text-3xl',
    xl: 'w-16 h-16 text-4xl',
  };

  if (participant.iconType === 'photo' && participant.photoUrl) {
    return (
      <img
        src={participant.photoUrl}
        alt={participant.name}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-300`}
      />
    );
  }

  return (
    <span className={`${sizeClasses[size]} flex items-center justify-center`}>
      {participant.icon}
    </span>
  );
}
