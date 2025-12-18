import pandas as pd
from typing import Dict, Any


class DataExecutioner:
    @staticmethod
    def apply_approved_cleaning(
        data_frames: Dict[str, pd.DataFrame], 
        approved_map: Dict[str, Any]
    ) -> Dict[str, pd.DataFrame]:
        """
        Iterates through the approved_map and applies changes only to specified tables/columns.
        """
        cleaned_dfs = {name: df.copy() for name, df in data_frames.items()}

        for table_name, columns in approved_map.items():
            if table_name not in cleaned_dfs:
                continue
            
            df = cleaned_dfs[table_name]

            for col_name, instructions in columns.items():
                if col_name not in df.columns:
                    continue

                action = instructions.get("action")
                replacement = instructions.get("replacement_value")

                # Execution Logic based on Action Type
                if action == "fill_constant":
                    df[col_name] = df[col_name].fillna(replacement)
                
                elif action == "drop_row":
                    df.dropna(subset=[col_name], inplace=True)
                
                elif action == "impute_mean":
                    if pd.api.types.is_numeric_dtype(df[col_name]):
                        df[col_name] = df[col_name].fillna(df[col_name].mean())
                
                elif action == "ignore":
                    # User rejected the change; do nothing
                    continue

        return cleaned_dfs
