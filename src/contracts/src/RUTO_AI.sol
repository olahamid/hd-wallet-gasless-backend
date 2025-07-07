// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.27;


/// @title RUTO_AI USDT TOKEN Mock.
/// @author RUTO-AI -- OLA HAMID.
/// @notice This contract is a mock implementation of the RUTO_AI USDT token.
// -----------------------------
//    ERC20 Mock Contract
// ----------------------------
import { ERC20} from "../lib/openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract RUTO_AI is ERC20 {
    // ---------------------
    //    State Variables
    // ---------------------

    uint8 dec;

    /// @dev Precision of the ERC20 token (e.g. 6 for stable, 18 for ETH).

    // -----------------
    //    Constructor
    // -----------------

    /// @notice This initializes the token contract.
    /// @param name     Name of the token.
    /// @param symbol   Symbol of the token.
    /// @param _dec     Precision of the token.
    constructor(string memory name, string memory symbol, uint8 _dec) ERC20(name, symbol) {
        dec = _dec;
    }

    // ---------------
    //    Functions
    // ---------------

    /// @notice mint R_usdt function.
    /// @param to The person receiving the minted token.
    /// @param amount The amount of tokens to mint.
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }

    /// @notice Returns the precision of the token.
    function decimals() public view override returns (uint8) {
        return dec;
    }
}