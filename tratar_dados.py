# Libs
import pandas as pd
import json

# Lê a base de indicadores
df = pd.read_excel("base_indicadores.xlsx", sheet_name="indicadores", engine="openpyxl")

# Dicionário com as aberturas de cada segmento para cada tópico
aberturas_segmento = {
    "credito": {
        "Especial": ['Cheque Especial', 'Cartões', 'CP', 'Consignado', 'Hipotecas', 'Autos', 'Demais'],
        "Prospera": ['Cheque Especial', 'Cartões', 'CP', 'Consignado', 'Hipotecas', 'Autos', 'Microcrédito', 'Demais'],
        "Select": ['Cheque Especial', 'Cartões', 'CP', 'Consignado', 'Hipotecas', 'Autos', 'Agro', 'Comex', 'Demais'],
        "PJ": ['Cheque Emp/ADP', 'Cartões', 'Hipotecas', 'Autos', 'Agro', 'Capital de Giro', 'Comex', 'Conta Garantida', 'Confirming', 'Internegócios', 'Demais'],
        "Corporate": ['Hipotecas', 'Autos', 'Agro', 'Capital de Giro', 'Comex', 'Conta Garantida', 'Confirming', 'Internegócios', 'Demais'],
        "SCIB": ['Cartões', 'Hipotecas', 'Autos', 'Agro', 'Capital de Giro', 'Comex', 'Confirming', 'Internegócios', 'Demais'],
        "Private": ['Cartões', 'CP', 'Hipotecas', 'Autos', 'Agro', 'Capital de Giro', 'Comex', 'Internegócios', 'Demais'],
        "Consumer": ['CP', 'Autos', 'Demais']
    },

    "captacoes": {
        "Especial": ['DAV', 'Contamax', 'CDB', 'Poupança', 'Letras', 'Demais'],
        "Prospera": ['DAV', 'Contamax', 'CDB', 'Poupança', 'Letras', 'Demais'],
        "Select": ['DAV', 'Contamax', 'CDB', 'Poupança', 'Letras', 'Captações Comex', 'Demais'],
        "PJ": ['DAV', 'Contamax', 'CDB', 'Poupança', 'Letras', 'Captações Comex', 'Time Deposit', 'Demais'],
        "Corporate": ['DAV', 'Contamax', 'CDB', 'Letras', 'Captações Comex', 'Time Deposit', 'Demais'],
        "SCIB": ['DAV', 'Contamax', 'CDB', 'Letras', 'Captações Comex', 'Time Deposit', 'LF', 'Demais'],
        "Private": ['DAV', 'Contamax', 'CDB', 'Letras', 'Captações Comex', 'COE', 'Demais'],
        "Consumer": []
    },

    "comissoes": {
        "Especial": ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Consórcio', 'Esfera', 'Fidelização INSS', 'Tecban', 'Demais'],
        "Prospera": ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Consórcio', 'Esfera', 'Fidelização INSS', 'Tecban', 'Demais'],
        "Select": ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Consórcio', 'Esfera', 'Tecban', 'AAA', 'Demais'],
        "PJ": ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Consórcio', 'Esfera', 'Tecban', 'Abertura Conta', 'Adquirência', 'FX', 'Cash', 'Demais'],
        "Corporate": ['Cartões', 'Seguros Open', 'Seguros Related', 'Tarifas C/C', 'Capitalização', 'Consórcio', 'Mercado de Capitais', 'Fiança', 'Abertura Conta', 'Adquirência', 'FX', 'Cash', 'Demais'],
        "SCIB": ['Mercado de Capitais', 'FX', 'Fiança', 'Comex', 'Cash', 'Corretagem', 'Demais'],
        "Private": ['Previdência', 'Fundos', 'FX', 'Mercado de Capitais', 'Comex', 'Esfera', 'Cartões', 'Demais'],
        "Consumer": ['Seguros Open', 'Seguros Related', 'Tarifas de Crédito', 'Demais']
    }
}

# Função que retorna um dicionário com os valores de cada abertura para um determinado segmento
def get_numbers(df, topico, indicador, segmento, aberturas_segmento):
    if topico not in ["cascada", "comissoes"]:
        new_df = df.loc[(df["Topico"] == topico) & (df["Indicador"] == indicador), ["Abertura", segmento]]
        
        if segmento in ["Especial", "Prospera", "Select"]:
            new_df["Abertura"] = new_df["Abertura"].apply(lambda x: "Cheque Especial" if x == "Cheque" else x)
        elif segmento == "PJ":
            new_df["Abertura"] = new_df["Abertura"].apply(lambda x: "Cheque Emp/ADP" if x == "Cheque" else x)
        new_df["Abertura"] = new_df["Abertura"].apply(lambda x: x if x in aberturas_segmento[topico][segmento] else "Demais")
    else:
        new_df = df.loc[(df["Topico"] == topico), ["Abertura", segmento]]
        
    return new_df.groupby("Abertura")[segmento].sum().to_dict()

# Cria uma lista com os tópicos e segmentos únicos
topicos = df["Topico"].unique()
segmentos = ["Especial", "Prospera", "Select", "PJ", "Corporate", "SCIB", "Private", "Consumer", "Total"]
indicadores = df.groupby("Topico")["Indicador"].unique().to_dict()

# Cria um dicionário com os indicadores de cada segmento
dict_indicadores = dict()
for segmento in segmentos:
    dict_indicadores[segmento] = {}
    for topico in topicos:
        if segmento == "Total" and topico != "cascada":
            continue
        dict_indicadores[segmento][topico] = {}
        for indicador in indicadores[topico]:
            try:
                dict_resultado = get_numbers(df, topico, indicador, segmento, aberturas_segmento)
            except:
                dict_resultado = {}

            if topico in ["cascada", "comissoes"]:
                dict_indicadores[segmento][topico] = dict_resultado
            else:
                dict_indicadores[segmento][topico][indicador] = dict_resultado

# Salva o dicionário em um arquivo JSON
with open("dict_indicadores.json", "w", encoding="utf-8") as f:
    json.dump(dict_indicadores, f, indent=4, ensure_ascii=False)