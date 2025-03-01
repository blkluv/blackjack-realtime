# Include .env file if it exists
-include .env

deploy-token:
	@echo "Deploying BlackjackToken..."
	@forge script script/DeployBlackjackToken.s.sol -g 90000 --private-key $(PRIVATE_KEY) --rpc-url $(RPC_URL) --broadcast

deploy-vault:
	@echo "Deploying BlackjackVault..."
	@forge script script/DeployBlackjackVault.s.sol -g 50000 --private-key $(PRIVATE_KEY) --rpc-url $(RPC_URL) --broadcast

.PHONY: deploy-token deploy-vault
