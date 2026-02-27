"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMerkleProofAtIndex = exports.getMerkleProof = exports.getMerkleRoot = exports.getMerkleTree = void 0;
const merkletreejs_1 = require("merkletreejs");
const sha3_1 = require("@noble/hashes/sha3");
/**
 * Creates a Merkle Tree from the provided data.
 */
const getMerkleTree = (data) => new merkletreejs_1.MerkleTree(data.map(sha3_1.keccak_256), sha3_1.keccak_256, {
    sortPairs: true,
});
exports.getMerkleTree = getMerkleTree;
/**
 * Creates a Merkle Root from the provided data.
 *
 * This root provides a short identifier for the
 * provided data that is unique and deterministic.
 * This means, we can use this root to verify that
 * a given data is part of the original data set.
 */
const getMerkleRoot = (data) => (0, exports.getMerkleTree)(data).getRoot();
exports.getMerkleRoot = getMerkleRoot;
/**
 * Creates a Merkle Proof for a given data item.
 *
 * This proof can be used to verify that the given
 * data item is part of the original data set.
 */
const getMerkleProof = (data, leaf, index) => (0, exports.getMerkleTree)(data)
    .getProof(Buffer.from((0, sha3_1.keccak_256)(leaf)), index)
    .map((proofItem) => proofItem.data);
exports.getMerkleProof = getMerkleProof;
/**
 * Creates a Merkle Proof for a data item at a given index.
 *
 * This proof can be used to verify that the data item at
 * the given index is part of the original data set.
 */
const getMerkleProofAtIndex = (data, index) => (0, exports.getMerkleProof)(data, data[index], index);
exports.getMerkleProofAtIndex = getMerkleProofAtIndex;
//# sourceMappingURL=merkle.js.map