def edit_format(test):
    import re

    # 괄호 내부 내용만 추출
    p = re.compile(r'\[\[[^\[\]\v]+\]\]')
    m = p.findall(test)
    print(m)

edit_format("웰컴 [[ 투더 [[뭉탱이]] !! ]] 월드~")

# result: ['[[뭉탱이]]']
