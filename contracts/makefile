# Include .env file if it exists
-include .env

deploy-token:
	@echo "Deploying BlackjackToken..."
	@forge script script/DeployBlackjackToken.s.sol -g 50000 --private-key $(PRIVATE_KEY) --rpc-url $(RPC_URL) --broadcast

deploy-wallet:
	@echo "Deploying BlackjackWallet..."
	@forge script script/DeployBlackjackWallet.s.sol -g 50000 --private-key $(PRIVATE_KEY) --rpc-url $(RPC_URL) --broadcast

.PHONY: deploy-token deploy-wallet
