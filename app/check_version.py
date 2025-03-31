# Verifica se a versão do app é igual à versão de referência
import os

path = "/mnt/c/Users/caiqu/OneDrive/projetos/simulador_referencia/"

def verificar_versao(path):
    # Versão deste arquivo
    with open("version.txt", 'r') as file:
        current_version = file.read()
    
    # Versão mais recente
    with open(os.path.join(path, "version.txt"), 'r') as file:
        latest_version = file.read()

    return current_version == latest_version

verificacao = verificar_versao(path)
print(f"Verificação de versão: {verificacao}")

