import { AuditLog } from './schema';

export const generateLogMessage = (log: AuditLog) => {
  const { action, entityTitle, entityType } = log;
  switch (action) {
    case 'create': {
      return `created ${entityType.toLowerCase()} "${entityTitle}"`;
    }
    case 'update': {
      return `updated ${entityType.toLowerCase()} "${entityTitle}"`;
    }
    case 'delete': {
      return `deleted ${entityType.toLowerCase()} "${entityTitle}"`;
    }
    default: {
      return `unknown action ${entityType.toLowerCase()} "${entityTitle}"`;
    }
  }
};
