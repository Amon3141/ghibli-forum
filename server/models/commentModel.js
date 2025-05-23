/**
 * @typedef {Object} Comment
 * @property {number} id - The unique identifier of the comment
 * @property {string} content - The content of the comment
 * @property {number} likes - The number of likes
 * @property {Date} createdAt - When the comment was created
 * @property {number} threadId - The ID of the associated thread
 * @property {Thread} thread - The associated thread
 * @property {number} authorId - The ID of the comment author
 * @property {Object} author - The author of the comment
 * @property {string} author.username - The username of the author
 * @property {string} author.userId - The userId of the author
 * @property {number} [parentId] - The ID of the parent comment (if reply)
 * @property {Object} [_count] - Count of related records
 * @property {number} [_count.replies] - Number of replies to this comment
 */

const prisma = require('../utils/PrismaClient');

/**
 * Comment model operations
 * @module models/commentModel
 */

/**
 * Finds a specific comment by its ID
 * @async
 * @param {number} id - The ID of the comment
 * @returns {Promise<Comment|null>} Comment object if found, null otherwise
 */
async function findCommentById(id) {
  return await prisma.comment.findUnique({ 
    where: { id },
    include: {
      author: {
        select: {
          username: true,
          userId: true
        }
      }
    }
  });
}

/**
 * Retrieves all top-level comments for a specific thread
 * @async
 * @param {number} threadId - The ID of the thread
 * @returns {Promise<Array<Comment>>} Array of top-level comment objects
 */
async function findCommentsByThread(threadId) {
  return await prisma.comment.findMany({
    where: { 
      threadId,
      parentId: null // Only get top-level comments
    },
    include: {
      author: true,
      _count: {
        select: {
          replies: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Find all comments by a specific author
 * @async
 * @param {number} authorId - The ID of the author
 * @returns {Promise<Array<Comment>>} Array of comment objects
 */
async function findCommentsByAuthor(authorId) {
  return await prisma.comment.findMany({
    where: { authorId },
    include: {
      author: true,
      thread: {
        select: {
          id: true,
          title: true
        }
      },
      _count: {
        select: {
          replies: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Retrieves all replies for a specific comment
 * @async
 * @param {number} commentId - The ID of the parent comment
 * @returns {Promise<Array<Comment>>} Array of reply objects
 */
async function findRepliesByComment(commentId) {
  return await prisma.comment.findMany({
    where: { 
      parentId: commentId
    },
    include: {
      author: true,
      replyTo: {
        select: {
          id: true,
          author: {
            select: {
              username: true,
              userId: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

/**
 * Creates a new comment
 * @async
 * @param {Object} data - The comment data
 * @param {string} data.content - The content of the comment
 * @param {number} data.threadId - The ID of the associated thread
 * @param {number} data.authorId - The ID of the comment author
 * @param {number} [data.parentId] - The ID of the parent comment (if reply)
 * @param {number} [data.replyToId] - The ID of the comment being replied to
 * @returns {Promise<Comment>} Created comment object
 */
async function createComment(data) {
  return await prisma.comment.create({
    data: {
      ...data,
      likes: 0
    },
    include: {
      author: true
    }
  });
}

/**
 * Updates an existing comment
 * @async
 * @param {number} id - The ID of the comment to update
 * @param {Object} data - The update data
 * @param {string} [data.content] - The updated content
 * @returns {Promise<Comment>} Updated comment object
 * @throws {Error} If comment not found
 */
async function updateComment(id, data) {
  return await prisma.comment.update({ 
    where: { id }, 
    data,
    include: {
      author: true
    }
  });
}

/**
 * Deletes a comment
 * @async
 * @param {number} id - The ID of the comment to delete
 * @returns {Promise<Comment>} Deleted comment object
 * @throws {Error} If comment not found
 */
async function deleteComment(id) {
  return await prisma.comment.delete({ where: { id }});
}

/**
 * Updates the likes count for a comment
 * @async
 * @param {number} id - The ID of the comment
 * @param {boolean} increment - Whether to increment or decrement the likes count
 * @returns {Promise<Comment>} Updated comment object
 */
async function updateLikes(id, increment = true) {
  return await prisma.comment.update({
    where: { id },
    data: {
      likes: {
        [increment ? 'increment' : 'decrement']: 1
      }
    }
  });
}

// Read operations
const readOperations = {
  findCommentsByThread,
  findCommentById,
  findRepliesByComment,
  findCommentsByAuthor
};

// Write operations
const writeOperations = {
  createComment,
  updateComment,
  deleteComment,
  updateLikes
};

module.exports = {
  ...readOperations,
  ...writeOperations
};
